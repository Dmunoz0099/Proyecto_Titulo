// evento.service.js -> lógica de negocio de la Agenda (EventoAgenda).
// Mismo patrón en capas que medicamentos: sacar el adulto mayor del usuario,
// chequear pertenencia y operar con Prisma.
//
// Sobre la HORA: la agenda es una rutina DIARIA, así que solo me importa la hora
// del día, no una fecha concreta. Para que el orden y la vista queden estables
// sin importar la zona horaria del navegador, guardo la hora sobre una fecha fija
// en UTC (1970-01-01) y la leo en UTC. Así "08:30" siempre se ve "08:30".

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// "08:30" -> Date (1970-01-01T08:30:00Z, en UTC)
function horaTextoAFecha(horaTexto) {
  return new Date(`1970-01-01T${horaTexto}:00.000Z`);
}

// chequea que el evento exista y sea del adulto mayor indicado
async function obtenerEventoPropio(eventoId, adultoMayorId) {
  const evento = await prisma.eventoAgenda.findUnique({
    where: { id: eventoId },
  });
  if (!evento || evento.adultoMayorId !== adultoMayorId) {
    throw crearError(404, 'Actividad no encontrada');
  }
  return evento;
}

// --- LISTAR (todos los eventos del adulto mayor) ---
// lo puede ver cualquier rol (paciente, cuidador, familiar)
export async function listar(idUsuario) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.eventoAgenda.findMany({
    where: { adultoMayorId },
    orderBy: { hora: 'asc' }, // por hora del día
  });
}

// --- CREAR (solo CUIDADOR) ---
export async function crear(idUsuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.eventoAgenda.create({
    data: {
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      hora: horaTextoAFecha(datos.hora),
      icono: datos.icono ?? null,
      adultoMayorId,
    },
  });
}

// --- ACTUALIZAR (solo CUIDADOR) ---
export async function actualizar(idUsuario, eventoId, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerEventoPropio(eventoId, adultoMayorId);

  return prisma.eventoAgenda.update({
    where: { id: eventoId },
    data: {
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      hora: horaTextoAFecha(datos.hora),
      icono: datos.icono ?? null,
    },
  });
}

// --- ELIMINAR (solo CUIDADOR) ---
// acá sí es borrado físico: un evento no tiene historial que valga la pena
// conservar (a diferencia del medicamento).
export async function eliminar(idUsuario, eventoId) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerEventoPropio(eventoId, adultoMayorId);

  return prisma.eventoAgenda.delete({
    where: { id: eventoId },
  });
}
