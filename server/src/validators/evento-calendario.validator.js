// evento-calendario.validator.js -> esquemas Zod del Calendario a largo plazo.
// A diferencia de la agenda (solo hora), acá el evento tiene FECHA concreta.
// La fecha llega como "YYYY-MM-DD" y la hora (opcional) como "HH:MM"; el service
// las junta en un DateTime.

import { z } from 'zod';

const fechaYMD = z
  .string({ required_error: 'La fecha es obligatoria' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD');

// hora opcional (24h). Si no viene, el service asume una por defecto.
const horaHHMM = z.preprocess(
  (valor) =>
    typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
  z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener el formato HH:MM (ej: 10:30)')
    .optional()
);

// Crear / editar un evento del calendario.
export const esquemaEventoCalendario = z.object({
  titulo: z
    .string({ required_error: 'El título es obligatorio' })
    .trim()
    .min(1, 'El título es obligatorio')
    .max(120, 'El título es demasiado largo'),

  fecha: fechaYMD,
  hora: horaHHMM,

  descripcion: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(300, 'La descripción es demasiado larga').optional()
  ),

  icono: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(40, 'El icono no es válido').optional()
  ),
});
