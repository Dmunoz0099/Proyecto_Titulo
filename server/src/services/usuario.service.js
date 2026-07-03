// usuario.service.js -> servicios chicos de apoyo sobre el Usuario, que se
// reusan en otros módulos. El clave: a partir del id del usuario logueado (que
// viaja en el JWT) sacar el id del AdultoMayor asociado. Casi todo (medicamentos,
// agenda, etc.) trabaja "sobre el adulto mayor del usuario", así que dejo esa
// consulta centralizada acá.

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';

// devuelve el adultoMayorId del usuario. Si la cuenta no está vinculada a ninguno,
// tiro un error claro (409) en vez de dejar que reviente más abajo de forma rara.
export async function obtenerAdultoMayorId(idUsuario) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: idUsuario },
    select: { adultoMayorId: true },
  });

  if (!usuario) {
    throw crearError(404, 'Usuario no encontrado');
  }
  if (!usuario.adultoMayorId) {
    throw crearError(
      409,
      'Tu cuenta todavía no está asociada a ningún adulto mayor'
    );
  }

  return usuario.adultoMayorId;
}
