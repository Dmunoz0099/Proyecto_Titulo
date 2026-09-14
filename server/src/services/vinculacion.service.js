// vinculacion.service.js -> lógica para asociar una cuenta a un adulto mayor.
//
// El modelo gira en torno al AdultoMayor: sin ese vínculo, un usuario recién
// registrado no puede ver ni cargar nada. Acá está el flujo que lo resuelve:
//   - el CUIDADOR crea al adulto mayor y obtiene un código para compartir;
//   - el FAMILIAR o el PACIENTE se unen tecleando ese código.
// Así todos apuntan al MISMO adulto mayor y no se duplican los datos.
//
// Ojo: desde que el JWT lleva el adultoMayorId adentro, al vincular no basta con
// guardar en la BD; hay que emitir un token NUEVO para que la sesión "vea" el
// vínculo sin tener que volver a iniciar sesión. Por eso crear/unir devuelven
// { usuario, token } igual que el login.

import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';
import { generarToken } from '../utils/jwt.js';
import { generarCodigo, normalizarCodigo } from '../utils/codigo.js';

// mismas rondas de bcrypt que en auth (10 es lo típico)
const RONDAS_SALT = 10;

// saca el password antes de devolver el usuario (nunca sale el hash al front)
function sinPassword(usuario) {
  const { password, ...resto } = usuario;
  return resto;
}

// token con id, rol y el adultoMayorId ya actualizado
function emitirToken(usuario) {
  return generarToken({
    id: usuario.id,
    rol: usuario.rol,
    adultoMayorId: usuario.adultoMayorId,
  });
}

// lee el usuario fresco de la BD (no me fío del token, que puede estar viejo)
async function usuarioActual(idUsuario) {
  const usuario = await prisma.usuario.findUnique({ where: { id: idUsuario } });
  if (!usuario) {
    throw crearError(404, 'Usuario no encontrado');
  }
  return usuario;
}

// genera un código único, reintentando por si (rarísimo) choca con uno existente
async function generarCodigoUnico() {
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo();
    const existe = await prisma.adultoMayor.findUnique({
      where: { codigoInvitacion: codigo },
    });
    if (!existe) return codigo;
  }
  // si en 5 intentos no salió uno libre, algo muy raro pasa
  throw crearError(500, 'No pudimos generar un código, inténtalo de nuevo');
}

// --- ESTADO ---
// ¿la cuenta ya está vinculada? Si sí, devuelvo a quién y (para el cuidador) el
// código, para que pueda re-verlo y compartirlo cuando quiera.
export async function estado(usuarioToken) {
  const usuario = await usuarioActual(usuarioToken.id);

  if (!usuario.adultoMayorId) {
    return { vinculado: false, rol: usuario.rol, adultoMayor: null, codigo: null };
  }

  const adultoMayor = await prisma.adultoMayor.findUnique({
    where: { id: usuario.adultoMayorId },
  });

  // para el cuidador informo también si ya existe la cuenta del paciente (así el
  // front muestra "crear cuenta" o "ya creada, usuario X")
  let cuentaPaciente = null;
  if (usuario.rol === 'CUIDADOR') {
    const paciente = await prisma.usuario.findFirst({
      where: { adultoMayorId: usuario.adultoMayorId, rol: 'PACIENTE' },
      select: { nombreUsuario: true },
    });
    cuentaPaciente = paciente
      ? { existe: true, nombreUsuario: paciente.nombreUsuario }
      : { existe: false, nombreUsuario: null };
  }

  return {
    vinculado: true,
    rol: usuario.rol,
    adultoMayor: adultoMayor
      ? { id: adultoMayor.id, nombre: adultoMayor.nombre }
      : null,
    // el código solo tiene sentido para quien invita (el cuidador)
    codigo: usuario.rol === 'CUIDADOR' ? adultoMayor?.codigoInvitacion ?? null : null,
    cuentaPaciente,
  };
}

// --- RED DE APOYO ---
// para un usuario ya vinculado: los datos del adulto mayor y quiénes comparten
// su cuenta (cuidador, familiares y el propio paciente). Es solo lectura: la usa
// el módulo "Familia" del familiar para ver con quién está conectado. Marco cuál
// es "yo" para que el front lo destaque.
//
// Devuelvo también el código de invitación: el familiar lo necesita para poder
// vincular a una NUEVA persona cuidadora (por ejemplo si la anterior renuncia) o
// a otro familiar, sin depender de que el cuidador se lo pase.
export async function redApoyo(usuarioToken) {
  const usuario = await usuarioActual(usuarioToken.id);

  if (!usuario.adultoMayorId) {
    throw crearError(409, 'Tu cuenta todavía no está vinculada a un adulto mayor');
  }

  const adultoMayor = await prisma.adultoMayor.findUnique({
    where: { id: usuario.adultoMayorId },
    select: {
      nombre: true,
      fechaNacimiento: true,
      notas: true,
      codigoInvitacion: true,
    },
  });
  if (!adultoMayor) {
    throw crearError(404, 'No encontramos al adulto mayor de tu cuenta');
  }

  const usuarios = await prisma.usuario.findMany({
    where: { adultoMayorId: usuario.adultoMayorId },
    select: { id: true, nombre: true, nombreUsuario: true, rol: true },
    orderBy: { creadoEn: 'asc' },
  });

  const miembros = usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    rol: u.rol,
    esYo: u.id === usuario.id,
  }));

  // ¿ya existe la cuenta con la que entra el paciente? El familiar la crea/gestiona
  // desde "Familia", así que necesita saber si mostrar "crear" o "ya creada".
  const paciente = usuarios.find((u) => u.rol === 'PACIENTE');
  const cuentaPaciente = paciente
    ? { existe: true, nombreUsuario: paciente.nombreUsuario }
    : { existe: false, nombreUsuario: null };

  return {
    adultoMayor: {
      nombre: adultoMayor.nombre,
      fechaNacimiento: adultoMayor.fechaNacimiento,
      notas: adultoMayor.notas,
    },
    codigo: adultoMayor.codigoInvitacion ?? null,
    miembros,
    cuentaPaciente,
  };
}

// --- DESVINCULAR A UN MIEMBRO (CUIDADOR o FAMILIAR ya vinculado) ---
// quita a otra persona de la cuenta del adulto mayor (le deja adultoMayorId en
// null, así pierde el acceso pero su cuenta sigue existiendo y puede volver a
// unirse con el código). Caso típico: la persona cuidadora renuncia o falta un
// día y entra otra nueva. No borra la cuenta ni ningún dato del adulto mayor.
//
// Reglas: solo dentro del MISMO adulto mayor; no te puedes quitar a ti mismo por
// acá; y no se puede quitar al PACIENTE (su cuenta ES la del adulto mayor).
export async function desvincular(usuarioToken, idObjetivo) {
  const solicitante = await usuarioActual(usuarioToken.id);

  if (!solicitante.adultoMayorId) {
    throw crearError(409, 'Tu cuenta no está vinculada a ningún adulto mayor');
  }

  if (idObjetivo === solicitante.id) {
    throw crearError(400, 'No puedes desvincularte a ti mismo desde aquí');
  }

  const objetivo = await prisma.usuario.findUnique({ where: { id: idObjetivo } });
  if (!objetivo || objetivo.adultoMayorId !== solicitante.adultoMayorId) {
    throw crearError(404, 'Esa persona no está en la red de apoyo de tu adulto mayor');
  }

  if (objetivo.rol === 'PACIENTE') {
    throw crearError(409, 'No puedes desvincular al adulto mayor de su propia cuenta');
  }

  await prisma.usuario.update({
    where: { id: objetivo.id },
    data: { adultoMayorId: null },
  });

  return { ok: true, id: objetivo.id, nombre: objetivo.nombre };
}

// --- CREAR PACIENTE (solo CUIDADOR, cuenta sin vincular) ---
// crea al adulto mayor, le genera un código de invitación y asocia al cuidador.
export async function crearPaciente(usuarioToken, datos) {
  const usuario = await usuarioActual(usuarioToken.id);

  if (usuario.adultoMayorId) {
    throw crearError(409, 'Tu cuenta ya está vinculada a un adulto mayor');
  }

  const codigo = await generarCodigoUnico();

  // creo el adulto mayor y, en la misma operación, engancho al cuidador. Uso una
  // transacción para no dejar un adulto mayor "colgado" si algo falla en el medio.
  const [adultoMayor, usuarioActualizado] = await prisma.$transaction(async (tx) => {
    const am = await tx.adultoMayor.create({
      data: {
        nombre: datos.nombre,
        fechaNacimiento: datos.fechaNacimiento
          ? new Date(datos.fechaNacimiento)
          : null,
        notas: datos.notas ?? null,
        codigoInvitacion: codigo,
      },
    });
    const u = await tx.usuario.update({
      where: { id: usuario.id },
      data: { adultoMayorId: am.id },
    });
    return [am, u];
  });

  return {
    usuario: sinPassword(usuarioActualizado),
    token: emitirToken(usuarioActualizado),
    adultoMayor: { id: adultoMayor.id, nombre: adultoMayor.nombre },
    codigo,
  };
}

// --- UNIRSE POR CÓDIGO (cualquier rol, cuenta sin vincular) ---
export async function unir(usuarioToken, datos) {
  const usuario = await usuarioActual(usuarioToken.id);

  if (usuario.adultoMayorId) {
    throw crearError(409, 'Tu cuenta ya está vinculada a un adulto mayor');
  }

  const codigo = normalizarCodigo(datos.codigo);
  const adultoMayor = await prisma.adultoMayor.findUnique({
    where: { codigoInvitacion: codigo },
  });
  if (!adultoMayor) {
    throw crearError(404, 'No encontramos ese código. Revísalo con quien te lo dio.');
  }

  const usuarioActualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { adultoMayorId: adultoMayor.id },
  });

  return {
    usuario: sinPassword(usuarioActualizado),
    token: emitirToken(usuarioActualizado),
    adultoMayor: { id: adultoMayor.id, nombre: adultoMayor.nombre },
  };
}

// --- CREAR LA CUENTA DEL PACIENTE (solo CUIDADOR ya vinculado) ---
// El adulto mayor no se registra solo: el cuidador le crea el usuario con una
// clave simple (sin correo) y se la entrega. La cuenta queda ligada al MISMO
// adulto mayor que cuida el cuidador. No devuelvo token: el cuidador sigue con su
// propia sesión; esto solo crea la cuenta del paciente.
export async function crearCuentaPaciente(usuarioToken, datos) {
  const cuidador = await usuarioActual(usuarioToken.id);

  if (!cuidador.adultoMayorId) {
    throw crearError(409, 'Primero crea el perfil del adulto mayor');
  }

  // una sola cuenta de paciente por adulto mayor (evita duplicados sin querer)
  const yaExiste = await prisma.usuario.findFirst({
    where: { adultoMayorId: cuidador.adultoMayorId, rol: 'PACIENTE' },
  });
  if (yaExiste) {
    throw crearError(409, 'Este adulto mayor ya tiene una cuenta de paciente');
  }

  // el nombre de usuario no puede estar tomado
  const usuarioTomado = await prisma.usuario.findUnique({
    where: { nombreUsuario: datos.nombreUsuario },
  });
  if (usuarioTomado) {
    throw crearError(409, 'Ese nombre de usuario ya está en uso');
  }

  const passwordHash = await bcrypt.hash(datos.password, RONDAS_SALT);

  const paciente = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      nombreUsuario: datos.nombreUsuario,
      password: passwordHash,
      rol: 'PACIENTE',
      adultoMayorId: cuidador.adultoMayorId,
    },
  });

  return { usuario: sinPassword(paciente) };
}

// --- CAMBIAR EL PIN DEL PACIENTE (solo CUIDADOR ya vinculado) ---
// por si el paciente lo olvidó o el cuidador quiere cambiarlo. Actúa sobre la
// cuenta de paciente de SU adulto mayor.
export async function cambiarPinPaciente(usuarioToken, datos) {
  const cuidador = await usuarioActual(usuarioToken.id);

  if (!cuidador.adultoMayorId) {
    throw crearError(409, 'Primero crea el perfil del adulto mayor');
  }

  const paciente = await prisma.usuario.findFirst({
    where: { adultoMayorId: cuidador.adultoMayorId, rol: 'PACIENTE' },
  });
  if (!paciente) {
    throw crearError(404, 'Todavía no creaste la cuenta del adulto mayor');
  }

  const passwordHash = await bcrypt.hash(datos.pin, RONDAS_SALT);
  await prisma.usuario.update({
    where: { id: paciente.id },
    data: { password: passwordHash },
  });

  return { ok: true, nombreUsuario: paciente.nombreUsuario };
}
