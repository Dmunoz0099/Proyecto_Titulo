// usuario.service.js -> servicios chicos de apoyo sobre el Usuario, que se
// reusan en otros módulos. El clave: a partir del id del usuario logueado (que
// viaja en el JWT) sacar el id del AdultoMayor asociado. Casi todo (medicamentos,
// agenda, etc.) trabaja "sobre el adulto mayor del usuario", así que dejo esa
// consulta centralizada acá.

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';

// devuelve el adultoMayorId del usuario. Si la cuenta no está vinculada a ninguno,
// tiro un error claro (409) en vez de dejar que reviente más abajo de forma rara.
//
// Recibe el objeto req.usuario (lo que viene del JWT: { id, rol, adultoMayorId }).
// CAMINO RÁPIDO: si el token ya trae el adultoMayorId lo devuelvo al toque, sin
// tocar la BD. Antes esto era una consulta que se repetía en CADA endpoint, y con
// la base remota ese viaje de red era lo que más pesaba. FALLBACK: si no viene
// (tokens viejos emitidos antes de este cambio, o cuenta recién vinculada), lo
// busco en la BD como antes. También acepto un id suelto por compatibilidad.
export async function obtenerAdultoMayorId(usuario) {
  // camino rápido: el adultoMayorId ya viaja en el token
  if (usuario && typeof usuario === 'object' && usuario.adultoMayorId) {
    return usuario.adultoMayorId;
  }

  // fallback: me quedo con el id (venga como objeto o como string suelto)
  const idUsuario =
    usuario && typeof usuario === 'object' ? usuario.id : usuario;

  const encontrado = await prisma.usuario.findUnique({
    where: { id: idUsuario },
    select: { adultoMayorId: true },
  });

  if (!encontrado) {
    throw crearError(404, 'Usuario no encontrado');
  }
  if (!encontrado.adultoMayorId) {
    throw crearError(
      409,
      'Tu cuenta todavía no está asociada a ningún adulto mayor'
    );
  }

  return encontrado.adultoMayorId;
}
