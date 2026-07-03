// api/auth.js -> llamadas a los endpoints de autenticación.
// Usan la instancia central de Axios (que ya pone el token solo). Los componentes
// llaman a estas funciones, no a axios directo.

import api from './axios.js';

// login. Devuelve { usuario, token }.
export async function login(credenciales) {
  const { data } = await api.post('/auth/login', credenciales);
  return data;
}

// registrar un usuario nuevo. Devuelve { usuario, token }.
export async function registro(datos) {
  const { data } = await api.post('/auth/registro', datos);
  return data;
}

// perfil del usuario logueado (pide token)
export async function obtenerPerfil() {
  const { data } = await api.get('/auth/perfil');
  return data;
}
