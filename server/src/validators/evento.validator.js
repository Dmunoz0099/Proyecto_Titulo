// evento.validator.js -> esquemas Zod de la Agenda (EventoAgenda). Misma idea que medicamentos.

import { z } from 'zod';

// La hora la valido como texto "HH:MM" (24h). El service la pasa a DateTime.
// Como la agenda es una rutina DIARIA, solo me importa la hora del día.
const horaHHMM = z
  .string({ required_error: 'La hora es obligatoria' })
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener el formato HH:MM (ej: 08:30)');

// Crear / editar un evento de la agenda.
export const esquemaEvento = z.object({
  titulo: z
    .string({ required_error: 'El título es obligatorio' })
    .trim()
    .min(1, 'El título es obligatorio')
    .max(120, 'El título es demasiado largo'),

  hora: horaHHMM,

  // descripción opcional (ej: "una vuelta por el parque")
  descripcion: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(300, 'La descripción es demasiado larga').optional()
  ),

  // clave del icono (ej: "walk", "cup", "pill"). Opcional; el front la usa
  // para mostrar una imagen amable junto al evento.
  icono: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(40, 'El icono no es válido').optional()
  ),
});
