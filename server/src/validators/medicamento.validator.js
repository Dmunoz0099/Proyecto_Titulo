// medicamento.validator.js -> esquemas Zod del módulo de medicamentos.
// Valido en el borde para que al service solo lleguen datos con la forma esperada.
// Este módulo terminó siendo la plantilla del resto (agenda, etc.).

import { z } from 'zod';

// Crear / editar un medicamento.
// nombre, dosis y horario van como texto obligatorio. Dejo "horario" libre
// (ej: "08:00" o "08:00 y 21:00") para no casarme con un formato.
export const esquemaMedicamento = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre es demasiado largo'),

  dosis: z
    .string({ required_error: 'La dosis es obligatoria' })
    .trim()
    .min(1, 'La dosis es obligatoria')
    .max(80, 'La dosis es demasiado larga'),

  horario: z
    .string({ required_error: 'El horario es obligatorio' })
    .trim()
    .min(1, 'El horario es obligatorio')
    .max(120, 'El horario es demasiado largo'),

  // observaciones opcionales (ej: "tomar con el desayuno").
  // Si viene vacío lo trato como "sin observaciones" (undefined).
  observaciones: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(300, 'Las observaciones son demasiado largas').optional()
  ),
});

// Registrar una toma.
// administrado: si se dio (true) o se saltó (false). Por defecto true, que es
// el caso normal ("marcar como dada"). comentario opcional para anotar algo.
export const esquemaToma = z.object({
  administrado: z.boolean().optional().default(true),

  comentario: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(300, 'El comentario es demasiado largo').optional()
  ),
});
