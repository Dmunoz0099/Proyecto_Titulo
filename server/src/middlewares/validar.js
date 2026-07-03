// validar.js -> middleware genérico de validación con Zod.
// Le paso un esquema, valida req.body: si falla responde 400 con el detalle,
// y si pasa reemplaza req.body por los datos ya limpios (trim, lowercase, etc.).

import { crearError } from '../utils/errores.js';

export function validar(esquema) {
  // devuelve el middleware que ya "sabe" qué esquema aplicar
  return (req, res, next) => {
    // safeParse no tira excepción: devuelve { success, data | error }
    const resultado = esquema.safeParse(req.body);

    if (!resultado.success) {
      // paso los errores de Zod a una lista más simple:
      // [{ campo: 'email', mensaje: 'El email no es válido' }, ...]
      const detalles = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }));
      return next(crearError(400, 'Datos inválidos', detalles));
    }

    // ok: me quedo con la versión saneada
    req.body = resultado.data;
    next();
  };
}
