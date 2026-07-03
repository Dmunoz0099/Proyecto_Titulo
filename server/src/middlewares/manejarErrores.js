// manejarErrores.js -> manejo central de errores.
// En Express un middleware de error se distingue por tener 4 params (err, req, res, next).
// Acá convierto cualquier error en un json con el mismo formato, para que el front
// siempre lea lo mismo. También va el 404 para rutas que no existen.

import { crearError } from '../utils/errores.js';

// rutas que no existen (se monta ANTES de manejarErrores)
export function rutaNoEncontrada(req, res, next) {
  next(crearError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export function manejarErrores(err, req, res, next) {
  // si el error trae su propio status lo respeto; si no, es un 500 inesperado
  const status = err.status || 500;

  // el cuerpo siempre lleva "error" con el mensaje
  const cuerpo = { error: err.message || 'Error interno del servidor' };

  // detalles opcionales (ej: errores de validación)
  if (err.detalles) {
    cuerpo.detalles = err.detalles;
  }

  // los 500 son los que de verdad no esperaba, así que los logueo enteros
  if (status === 500) {
    console.error('💥 Error no controlado:', err);
  }

  res.status(status).json(cuerpo);
}
