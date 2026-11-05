// usuario.service.js -> servicios chicos de apoyo sobre el Usuario, que se
// reusan en otros módulos. El clave: a partir del id del usuario logueado (que
// viaja en el JWT) sacar el id del AdultoMayor asociado. Casi todo (medicamentos,
// agenda, etc.) trabaja "sobre el adulto mayor del usuario", así que dejo esa
// consulta centralizada acá.

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';

// cuánto me fío de un vínculo ya consultado antes de volver a mirar la BD
const VIGENCIA_VINCULO_MS = 30 * 1000;

// idUsuario -> { adultoMayorId, hasta }. Solo guardo vínculos que existen: si
// alguien recién se une, no quiero que un "no vinculado" viejo lo deje afuera.
const vinculos = new Map();

// para cuando un vínculo cambia (desvincular, unirse): lo saco de la memoria y la
// próxima petición va directo a la BD
export function olvidarVinculo(idUsuario) {
  vinculos.delete(idUsuario);
}

// devuelve el adultoMayorId del usuario. Si la cuenta no está vinculada a ninguno,
// tiro un error claro (409) en vez de dejar que reviente más abajo de forma rara.
//
// Recibe el objeto req.usuario (lo que viene del JWT: { id, rol, adultoMayorId }).
// Ojo: antes devolvía directo el adultoMayorId del token, sin tocar la BD (la base
// remota era lo que más pesaba). Pero así, si el familiar desvinculaba a la
// cuidadora, su token le seguía sirviendo hasta vencer (¡hasta 30 días!). Ahora la
// BD manda: consulto el vínculo y lo recuerdo 30 segundos, así casi no sumo viajes
// y el acceso se corta en menos de medio minuto. También acepto un id suelto.
export async function obtenerAdultoMayorId(usuario) {
  const idUsuario =
    usuario && typeof usuario === 'object' ? usuario.id : usuario;

  const guardado = vinculos.get(idUsuario);
  if (guardado && guardado.hasta > Date.now()) {
    return guardado.adultoMayorId;
  }

  const encontrado = await prisma.usuario.findUnique({
    where: { id: idUsuario },
    select: { adultoMayorId: true },
  });

  if (!encontrado) {
    throw crearError(404, 'Usuario no encontrado');
  }
  if (!encontrado.adultoMayorId) {
    vinculos.delete(idUsuario);
    throw crearError(
      409,
      'Tu cuenta todavía no está asociada a ningún adulto mayor'
    );
  }

  vinculos.set(idUsuario, {
    adultoMayorId: encontrado.adultoMayorId,
    hasta: Date.now() + VIGENCIA_VINCULO_MS,
  });
  return encontrado.adultoMayorId;
}
