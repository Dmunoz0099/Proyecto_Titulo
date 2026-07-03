// api/juegos.js -> llamadas a los endpoints de juegos.
// Usan la instancia central de Axios; los componentes pasan por acá, no por axios directo.

import api from './axios.js';

// guarda el resultado de una partida. Devuelve la sesión creada.
// datos = { puntaje, aciertos, errores, duracionSegundos }.
export async function registrarSesion(datos) {
  const { data } = await api.post('/juegos/sesiones', datos);
  return data;
}

// lista las sesiones de juego del adulto mayor (las más nuevas primero)
export async function listarSesiones() {
  const { data } = await api.get('/juegos/sesiones');
  return data;
}
