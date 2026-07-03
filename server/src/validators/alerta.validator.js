// alerta.validator.js -> esquema Zod del módulo de alertas SOS.
// Como en el resto, valido en el borde para que al service lleguen datos limpios.

import { z } from 'zod';

// Crear alerta SOS. El mensaje es opcional: el botón "Necesito ayuda" puede ir
// sin texto (se asume "Necesito ayuda"). Si viene vacío lo dejo como undefined.
export const esquemaAlerta = z.object({
  mensaje: z.preprocess(
    (valor) =>
      typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
    z.string().trim().max(300, 'El mensaje es demasiado largo').optional()
  ),
});
