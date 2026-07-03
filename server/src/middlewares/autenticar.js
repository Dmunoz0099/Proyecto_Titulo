// autenticar.js -> middleware que protege rutas: pide un JWT válido.
// Lee "Authorization: Bearer <token>", lo verifica y deja el usuario en req.usuario.

import { verificarToken } from '../utils/jwt.js';
import { crearError } from '../utils/errores.js';

export function autenticar(req, res, next) {
  const cabecera = req.headers.authorization;

  // tiene que venir y empezar con "Bearer "
  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return next(crearError(401, 'No autenticado: falta el token'));
  }

  // el token es lo que va después de "Bearer "
  const token = cabecera.split(' ')[1];

  try {
    // si el token es válido recupero lo que guardé al firmarlo: { id, rol }
    const payload = verificarToken(token);

    // lo dejo a mano para el resto de la cadena
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (error) {
    // token trucho, manipulado o vencido
    return next(crearError(401, 'Token inválido o expirado'));
  }
}
