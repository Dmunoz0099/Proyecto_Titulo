// auth.validator.js -> esquemas Zod para lo que llega en las peticiones de auth.
// Validar antes de tocar la BD nos cubre de datos malformados.

import { z } from 'zod';

// Nombre de usuario: con esto inician sesión (en vez del email). Lo paso a
// minúsculas y solo dejo letras, números, punto, guion y guion bajo, para que
// sea fácil de dictar/escribir y sin ambigüedades (nada de espacios ni acentos).
// Ej: "rosa.perez", "rosita_2".
const nombreUsuario = z
  .string({ required_error: 'El nombre de usuario es obligatorio' })
  .trim()
  .toLowerCase()
  .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
  .max(30, 'El nombre de usuario no puede superar los 30 caracteres')
  .regex(
    /^[a-z0-9._-]+$/,
    'Usa solo letras, números, punto, guion o guion bajo (sin espacios ni acentos)'
  );

// Email OPCIONAL. Si viene vacío (o solo espacios) lo dejo como undefined.
// Si trae algo, tiene que ser un email válido. Lo guardo en minúsculas para
// no tener duplicados.
const emailOpcional = z.preprocess(
  (valor) =>
    typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
  z.string().trim().toLowerCase().email('El email no es válido').optional()
);

// Registro de un usuario nuevo.
export const esquemaRegistro = z.object({
  // nombre obligatorio (al menos 1 carácter, sin espacios de sobra)
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio'),

  // usuario con el que va a entrar (obligatorio)
  nombreUsuario,

  // email opcional (ver arriba)
  email: emailOpcional,

  // contraseña de mínimo 6 caracteres (requisito de la fase)
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),

  // rol: solo estos tres valores (coinciden con el enum Rol de Prisma/Postgres)
  rol: z.enum(['PACIENTE', 'CUIDADOR', 'FAMILIAR'], {
    message: 'El rol debe ser PACIENTE, CUIDADOR o FAMILIAR',
  }),
});

// Login. Ahora se entra con el nombre de usuario. No exijo largo mínimo de
// contraseña (eso ya se validó en el registro); solo que venga.
export const esquemaLogin = z.object({
  nombreUsuario,
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});
