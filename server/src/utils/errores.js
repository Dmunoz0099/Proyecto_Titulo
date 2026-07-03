// errores.js -> helper para crear errores con su código HTTP.
// Así desde services y middlewares puedo tirar errores "con info" (status + detalles)
// que después manejarErrores.js convierte en un json coherente.

// crearError(404, 'No encontrado') -> Error con .status = 404
export function crearError(status, mensaje, detalles) {
  const error = new Error(mensaje);
  error.status = status; // el código HTTP que voy a devolver
  if (detalles) {
    // info extra opcional (ej: errores de validación campo por campo) para el front
    error.detalles = detalles;
  }
  return error;
}
