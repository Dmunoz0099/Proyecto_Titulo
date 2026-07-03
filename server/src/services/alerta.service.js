// alerta.service.js -> lógica de negocio de las alertas SOS.
// Mismo patrón que medicamentos/agenda: siempre sobre el adulto mayor del usuario.
//
// La idea: el botón "Necesito ayuda" es exclusivo del PACIENTE. El CUIDADOR y el
// FAMILIAR no la crean, solo la consultan y la marcan atendida. Así cada rol tiene
// acciones distintas, no solo "más o menos permisos".

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// chequea que la alerta exista y sea del adulto mayor indicado
async function obtenerAlertaPropia(alertaId, adultoMayorId) {
  const alerta = await prisma.alertaSos.findUnique({ where: { id: alertaId } });
  if (!alerta || alerta.adultoMayorId !== adultoMayorId) {
    throw crearError(404, 'Alerta no encontrada');
  }
  return alerta;
}

// --- CREAR (solo PACIENTE) ---
// guarda quién la generó (el usuario logueado) y el momento exacto
export async function crear(idUsuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.alertaSos.create({
    data: {
      mensaje: datos.mensaje ?? null,
      adultoMayorId,
      creadaPorId: idUsuario,
    },
  });
}

// --- LISTAR (para CUIDADOR / FAMILIAR) ---
// las alertas del adulto mayor, primero las pendientes y, a igualdad, de la más
// nueva a la más vieja. Incluye el nombre de quién la generó y quién la atendió.
export async function listar(idUsuario) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.alertaSos.findMany({
    where: { adultoMayorId },
    orderBy: [{ atendida: 'asc' }, { creadaEn: 'desc' }],
    include: {
      creadaPor: { select: { nombre: true } },
      atendidaPor: { select: { nombre: true } },
    },
  });
}

// --- ATENDER (para CUIDADOR / FAMILIAR) ---
// marca la alerta como atendida, con quién la atendió y cuándo
export async function atender(idUsuario, alertaId) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerAlertaPropia(alertaId, adultoMayorId);

  return prisma.alertaSos.update({
    where: { id: alertaId },
    data: {
      atendida: true,
      atendidaEn: new Date(),
      atendidaPorId: idUsuario,
    },
  });
}
