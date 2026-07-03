// juego.validator.js -> esquema Zod del módulo de juegos.
// Por ahora solo valido el registro de una sesión (el resultado de una partida).

import { z } from 'zod';

// entero >= 0 (acepta strings numéricos por si acaso)
const enteroNoNegativo = z.coerce
  .number({ invalid_type_error: 'Debe ser un número' })
  .int('Debe ser un número entero')
  .min(0, 'No puede ser negativo');

// Registrar una sesión: puntaje, aciertos, errores y duración en segundos.
// Todavía no guardo qué juego fue (solo existe Memorice); cuando haya más
// juegos agrego una columna para diferenciarlos.
export const esquemaSesion = z.object({
  puntaje: enteroNoNegativo.max(100000, 'Puntaje fuera de rango'),
  aciertos: enteroNoNegativo.max(1000, 'Valor fuera de rango'),
  errores: enteroNoNegativo.max(10000, 'Valor fuera de rango'),
  duracionSegundos: enteroNoNegativo.max(86400, 'Duración fuera de rango'),
});
