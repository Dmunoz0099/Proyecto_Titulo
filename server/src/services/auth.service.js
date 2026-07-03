// auth.service.js -> la lógica de negocio de la autenticación.
// Acá (no en el controlador) están las reglas: hashear la contraseña, chequear
// email/usuario repetido, comparar credenciales y emitir el token. A la BD se
// entra solo por Prisma.

import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { generarToken } from '../utils/jwt.js';
import { crearError } from '../utils/errores.js';

// rondas de bcrypt: más = más seguro pero más lento. 10 es lo típico.
const RONDAS_SALT = 10;

// saca el password del usuario antes de devolverlo. El hash NUNCA sale al front.
function sinPassword(usuario) {
  const { password, ...resto } = usuario;
  return resto;
}

// --- REGISTRO ---
export async function registrar(datos) {
  // el nombre de usuario no puede estar tomado
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { nombreUsuario: datos.nombreUsuario },
  });
  if (usuarioExistente) {
    throw crearError(409, 'Ese nombre de usuario ya está en uso'); // 409 = conflicto
  }

  // si vino email, también tiene que ser único
  if (datos.email) {
    const emailExistente = await prisma.usuario.findUnique({
      where: { email: datos.email },
    });
    if (emailExistente) {
      throw crearError(409, 'Ya existe un usuario con ese email');
    }
  }

  // hasheamos la contraseña (nunca se guarda en texto plano)
  const passwordHash = await bcrypt.hash(datos.password, RONDAS_SALT);

  // creamos el usuario. Si no hay email viene undefined -> Prisma lo guarda como NULL.
  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      nombreUsuario: datos.nombreUsuario,
      email: datos.email ?? null,
      password: passwordHash,
      rol: datos.rol,
    },
  });

  // token con lo mínimo: id y rol
  const token = generarToken({ id: usuario.id, rol: usuario.rol });

  // devolvemos el usuario sin password + el token
  return { usuario: sinPassword(usuario), token };
}

// --- LOGIN ---
export async function login(datos) {
  // buscamos por nombre de usuario
  const usuario = await prisma.usuario.findUnique({
    where: { nombreUsuario: datos.nombreUsuario },
  });

  // Si no existe o la contraseña no coincide, devuelvo el MISMO error 401.
  // Así no le digo a nadie si el usuario existe o no.
  if (!usuario) {
    throw crearError(401, 'Usuario o contraseña incorrectos');
  }

  const passwordOk = await bcrypt.compare(datos.password, usuario.password);
  if (!passwordOk) {
    throw crearError(401, 'Usuario o contraseña incorrectos');
  }

  // todo ok: token y usuario
  const token = generarToken({ id: usuario.id, rol: usuario.rol });
  return { usuario: sinPassword(usuario), token };
}

// --- PERFIL ---
// datos del usuario logueado a partir de su id
export async function obtenerPerfil(idUsuario) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: idUsuario },
  });
  if (!usuario) {
    throw crearError(404, 'Usuario no encontrado');
  }
  return sinPassword(usuario);
}
