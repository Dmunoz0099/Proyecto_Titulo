// juego.service.js -> lógica de negocio de los juegos.
// Mismo patrón que el resto: siempre sobre el adulto mayor del usuario.
//
// Guarda y consulta las sesiones de juego (SesionJuego), que son la base del
// "Seguimiento": permiten ver el progreso partida a partida (puntaje, aciertos,
// errores, tiempo).

import { prisma } from '../config/prisma.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// --- REGISTRAR una sesión (resultado de una partida) ---
export async function registrarSesion(idUsuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.sesionJuego.create({
    data: {
      fecha: new Date(),
      puntaje: datos.puntaje,
      aciertos: datos.aciertos,
      errores: datos.errores,
      duracionSegundos: datos.duracionSegundos,
      adultoMayorId,
    },
  });
}

// --- LISTAR sesiones del adulto mayor (para el seguimiento) ---
// de la más nueva a la más vieja. Sirve para cualquier rol: el paciente ve su
// propio progreso y el cuidador/familiar monitorean.
export async function listarSesiones(idUsuario) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.sesionJuego.findMany({
    where: { adultoMayorId },
    orderBy: { fecha: 'desc' },
  });
}
