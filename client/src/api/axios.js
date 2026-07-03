// axios.js -> la instancia central de Axios para hablar con el backend.
// Regla del proyecto: ningún componente usa axios directo, todos pasan por api/.

import axios from 'axios';

// instancia con la config común a todas las peticiones
const api = axios.create({
  // baseURL se antepone a cada ruta. En dev es "/api" y el proxy de Vite lo
  // reenvía al backend (ver vite.config.js).
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// interceptor: antes de mandar cualquier request le pego el token JWT (si hay)
// en la cabecera Authorization, así no lo repito en cada llamada.
api.interceptors.request.use((config) => {
  // el token que guardamos al hacer login. Puede no existir todavía.
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
