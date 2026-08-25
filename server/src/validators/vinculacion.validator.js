// vinculacion.validator.js -> esquemas Zod para vincular una cuenta a un adulto
// mayor: crear al adulto mayor (lo hace el cuidador) o unirse con un código.

import { z } from 'zod';
import { nombreUsuario } from './auth.validator.js';

// Datos para crear al adulto mayor. Solo el nombre es obligatorio; la fecha de
// nacimiento y las notas son opcionales (se pueden completar después).
export const esquemaCrearPaciente = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'Escribe el nombre del adulto mayor'),

  // fecha en formato "YYYY-MM-DD" (lo que manda un <input type="date">). Opcional.
  fechaNacimiento: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no es válida')
      .optional()
  ),

  notas: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(500, 'Las notas son demasiado largas').optional()
  ),
});

// Unirse a un adulto mayor existente con el código que dio el cuidador.
export const esquemaUnir = z.object({
  codigo: z
    .string({ required_error: 'El código es obligatorio' })
    .trim()
    .min(1, 'Escribe el código de invitación'),
});

// PIN del paciente: 4 dígitos exactos. Es su clave (se guarda hasheada igual que
// cualquier contraseña), pero pensada como un número fácil de recordar y de teclear
// en un teclado grande. La reuso en crear cuenta y en cambiar PIN.
const pin = z
  .string({ required_error: 'El PIN es obligatorio' })
  .regex(/^\d{4}$/, 'El PIN debe ser de 4 números');

// El cuidador crea la cuenta del paciente (adulto mayor). No se le pide correo
// (no siempre tienen) y la clave es un PIN de 4 números que elige el cuidador y
// le dicta/entrega al paciente.
export const esquemaCuentaPaciente = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'Escribe el nombre del paciente'),

  nombreUsuario,

  // el front lo manda como "password" (es la clave del paciente)
  password: pin,
});

// Cambiar el PIN del paciente (lo hace el cuidador).
export const esquemaPin = z.object({ pin });
