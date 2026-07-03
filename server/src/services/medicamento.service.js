// medicamento.service.js -> lógica de negocio de medicamentos.
// Todo el acceso a datos pasa por Prisma. Cada función trabaja siempre sobre el
// adulto mayor del usuario logueado, así nadie puede meterse con los datos de otro.
//
// El patrón (que después copié en los demás módulos) es:
//   1) sacar el adultoMayorId del usuario,
//   2) si aplica, chequear que el recurso sea de ese adulto,
//   3) recién ahí operar con Prisma.

import { prisma } from '../config/prisma.js';
import { crearError } from '../utils/errores.js';
import { obtenerAdultoMayorId } from './usuario.service.js';

// chequea que el medicamento exista y sea del adulto mayor indicado.
// Devuelve el medicamento o tira 404. Evita que uno opere sobre los de otro.
async function obtenerMedicamentoPropio(medicamentoId, adultoMayorId) {
  const medicamento = await prisma.medicamento.findUnique({
    where: { id: medicamentoId },
  });
  if (!medicamento || medicamento.adultoMayorId !== adultoMayorId) {
    throw crearError(404, 'Medicamento no encontrado');
  }
  return medicamento;
}

// --- LISTAR (medicamentos activos del adulto mayor) ---
export async function listarActivos(idUsuario) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.medicamento.findMany({
    where: { adultoMayorId, activo: true },
    orderBy: { creadoEn: 'asc' },
  });
}

// --- CREAR ---
export async function crear(idUsuario, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  return prisma.medicamento.create({
    data: {
      nombre: datos.nombre,
      dosis: datos.dosis,
      horario: datos.horario,
      observaciones: datos.observaciones ?? null,
      adultoMayorId,
    },
  });
}

// --- ACTUALIZAR ---
export async function actualizar(idUsuario, medicamentoId, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerMedicamentoPropio(medicamentoId, adultoMayorId);

  return prisma.medicamento.update({
    where: { id: medicamentoId },
    data: {
      nombre: datos.nombre,
      dosis: datos.dosis,
      horario: datos.horario,
      observaciones: datos.observaciones ?? null,
    },
  });
}

// --- ELIMINAR (borrado lógico con el campo activo) ---
// No borro la fila: marco activo=false. Así conservo el historial de tomas y
// más adelante podría reactivarlo.
export async function eliminar(idUsuario, medicamentoId) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerMedicamentoPropio(medicamentoId, adultoMayorId);

  return prisma.medicamento.update({
    where: { id: medicamentoId },
    data: { activo: false },
  });
}

// --- REGISTRAR UNA TOMA ---
// Crea un RegistroMedicamento guardando quién la registró (el usuario logueado)
// y la fecha/hora exacta del momento.
export async function registrarToma(idUsuario, medicamentoId, datos) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerMedicamentoPropio(medicamentoId, adultoMayorId);

  return prisma.registroMedicamento.create({
    data: {
      administrado: datos.administrado ?? true,
      comentario: datos.comentario ?? null,
      fechaHora: new Date(),
      medicamentoId,
      registradoPorId: idUsuario,
    },
  });
}

// --- HISTORIAL de tomas de un medicamento ---
// Las tomas de la más nueva a la más vieja, con el nombre de quién la registró.
export async function historial(idUsuario, medicamentoId) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);
  await obtenerMedicamentoPropio(medicamentoId, adultoMayorId);

  return prisma.registroMedicamento.findMany({
    where: { medicamentoId },
    orderBy: { fechaHora: 'desc' },
    include: {
      registradoPor: { select: { nombre: true } },
    },
  });
}

// --- TODAS las tomas del adulto mayor (en una sola consulta) ---
// El front lo usa para armar la pestaña "Hoy" y el historial sin pedir el
// historial de cada medicamento por separado.
export async function listarTomas(idUsuario) {
  const adultoMayorId = await obtenerAdultoMayorId(idUsuario);

  return prisma.registroMedicamento.findMany({
    // filtro por la relación: solo tomas de medicamentos de este adulto mayor
    where: { medicamento: { adultoMayorId } },
    orderBy: { fechaHora: 'desc' },
    include: {
      registradoPor: { select: { nombre: true } },
    },
  });
}
