// jwt.js -> generar y verificar tokens JWT.
// Centralizo acá el uso de jsonwebtoken para no repetir el secreto por todos lados.

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// firma un token con el payload que le pase (ej: id y rol del usuario).
// Expira según JWT_EXPIRES_IN.
export function generarToken(payload) {
  return jwt.sign(payload, config.jwt.secreto, {
    expiresIn: config.jwt.expiraEn,
  });
}

// verifica el token (firma ok y no vencido). Si está bien devuelve el payload;
// si no, lanza excepción (la agarramos en el middleware de autenticación).
export function verificarToken(token) {
  return jwt.verify(token, config.jwt.secreto);
}
