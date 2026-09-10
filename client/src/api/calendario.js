// api/calendario.js -> llamadas a los endpoints del Calendario a largo plazo.
// Mismo patrón que api/agenda.js: pasan por la instancia central de Axios.

import api from './axios.js';

// lista los eventos del calendario (cualquier rol)
export async function listarEventosCalendario() {
  const { data } = await api.get('/calendario');
  return data;
}

// crear (solo CUIDADOR). Devuelve el creado.
export async function crearEventoCalendario(datos) {
  const { data } = await api.post('/calendario', datos);
  return data;
}

// actualizar (solo CUIDADOR). Devuelve el actualizado.
export async function actualizarEventoCalendario(id, datos) {
  const { data } = await api.put(`/calendario/${id}`, datos);
  return data;
}

// eliminar (solo CUIDADOR)
export async function eliminarEventoCalendario(id) {
  await api.delete(`/calendario/${id}`);
}
