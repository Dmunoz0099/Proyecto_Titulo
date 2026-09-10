// evento-calendario.service.js -> lógica de negocio del Calendario a largo plazo
// (EventoCalendario). Mismo patrón en capas que la agenda: sacar el adulto mayor
// del usuario, chequear pertenencia y operar con Prisma.
//
// Sobre la FECHA/HORA: a diferencia de la agenda (rutina diaria, solo hora), acá
// el evento tiene un día concreto. Para que la fecha y la hora se vean IGUAL sin
// importar la zona horaria del navegador (mismo criterio que ya usa la agenda),
// guardo el "reloj de pared" en UTC: "2026-10-15" + "10:30" -> 2026-10-15T10:30Z,
// y siempre lo leo/formateo en UTC. Así "10:30 del 15-oct" no se corre por la zona.

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// hora por defecto cuando el evento no trae una (ej: un cumpleaños "todo el día")
const HORA_POR_DEFECTO = '09:00';

// "2026-10-15" + "10:30" -> Date (2026-10-15T10:30:00Z, en UTC)
function fechaHoraAFecha(fechaYMD, horaTexto) {
  const hora = horaTexto || HORA_POR_DEFECTO;
  return new Date(`${fechaYMD}T${hora}:00.000Z`);
}

// chequea que el evento exista y sea del adulto mayor indicado
async function obtenerEventoPropio(eventoId, adultoMayorId) {
  const evento = await prisma.eventoCalendario.findUnique({
    where: { id: eventoId },
  });
  if (!evento || evento.adultoMayorId !== adultoMayorId) {
    throw crearError(404, 'Evento no encontrado');
  }
  return evento;
}

// --- LISTAR (todos los eventos del adulto mayor, ordenados por fecha) ---
// lo puede ver cualquier rol (paciente, cuidador, familiar)
export async function listar(usuario) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  return prisma.eventoCalendario.findMany({
    where: { adultoMayorId },
    orderBy: { fecha: 'asc' },
  });
}

// --- CREAR (solo CUIDADOR) ---
export async function crear(usuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  return prisma.eventoCalendario.create({
    data: {
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      fecha: fechaHoraAFecha(datos.fecha, datos.hora),
      icono: datos.icono ?? null,
      adultoMayorId,
    },
  });
}

// --- ACTUALIZAR (solo CUIDADOR) ---
export async function actualizar(usuario, eventoId, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  await obtenerEventoPropio(eventoId, adultoMayorId);

  return prisma.eventoCalendario.update({
    where: { id: eventoId },
    data: {
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      fecha: fechaHoraAFecha(datos.fecha, datos.hora),
      icono: datos.icono ?? null,
    },
  });
}

// --- ELIMINAR (solo CUIDADOR) ---
// borrado físico: un evento de calendario no tiene historial que conservar.
export async function eliminar(usuario, eventoId) {
  const adultoMayorId = await obtenerAdultoMayorId(usuario);
  await obtenerEventoPropio(eventoId, adultoMayorId);

  return prisma.eventoCalendario.delete({
    where: { id: eventoId },
  });
}
