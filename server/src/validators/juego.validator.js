// juego.validator.js -> esquema Zod del módulo de juegos.
// Por ahora solo valido el registro de una sesión (el resultado de una partida).

import { z } from 'zod';

// entero >= 0 (acepta strings numéricos por si acaso)
const enteroNoNegativo = z.coerce
  .number({ invalid_type_error: 'Debe ser un número' })
  .int('Debe ser un número entero')
  .min(0, 'No puede ser negativo');

// los juegos disponibles. Lo exporto para reutilizarlo al filtrar el listado.
export const TIPOS_JUEGO = ['PALABRAS', 'SOPA_LETRAS'];

// Registrar una sesión: qué juego fue, puntaje, aciertos, errores y duración.
// tipoJuego trae default PALABRAS: si el juego viejo (Memorice) no lo manda,
// igual queda bien clasificado y no rompe nada.
export const esquemaSesion = z.object({
  tipoJuego: z.enum(TIPOS_JUEGO).default('PALABRAS'),
  puntaje: enteroNoNegativo.max(100000, 'Puntaje fuera de rango'),
  aciertos: enteroNoNegativo.max(1000, 'Valor fuera de rango'),
  errores: enteroNoNegativo.max(10000, 'Valor fuera de rango'),
  duracionSegundos: enteroNoNegativo.max(86400, 'Duración fuera de rango'),
});
