// juego.service.js -> lógica de negocio de los juegos.
// Mismo patrón que el resto: siempre sobre el adulto mayor del usuario.
//
// Guarda y consulta las sesiones de juego (SesionJuego), que son la base del
// "Seguimiento": permiten ver el progreso partida a partida (puntaje, aciertos,
// errores, tiempo).

import { prisma } from '../config/prisma.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// --- REGISTRAR una sesión (resultado de una partida) ---
export async function registrarSesion(usuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  return prisma.sesionJuego.create({
    data: {
      fecha: new Date(),
      tipoJuego: datos.tipoJuego, // ya viene con default 'PALABRAS' del validador
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
// propio progreso y el cuidador/familiar monitorean. Se puede filtrar por juego
// pasando { tipoJuego }; si no viene, devuelve las de todos los juegos.
export async function listarSesiones(usuario, { tipoJuego } = {}) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  const where = { adultoMayorId };
  if (tipoJuego) where.tipoJuego = tipoJuego;
  return prisma.sesionJuego.findMany({
    where,
    orderBy: { fecha: 'desc' },
  });
}
