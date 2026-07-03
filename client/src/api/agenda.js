// api/agenda.js -> llamadas a los endpoints de la agenda.
// Usan la instancia central de Axios; los componentes pasan por acá, nunca por axios directo.

import api from './axios.js';

// lista los eventos de la agenda (cualquier rol)
export async function listarEventos() {
  const { data } = await api.get('/agenda');
  return data;
}

// crear (solo CUIDADOR). Devuelve el creado.
export async function crearEvento(datos) {
  const { data } = await api.post('/agenda', datos);
  return data;
}

// actualizar (solo CUIDADOR). Devuelve el actualizado.
export async function actualizarEvento(id, datos) {
  const { data } = await api.put(`/agenda/${id}`, datos);
  return data;
}

// eliminar (solo CUIDADOR)
export async function eliminarEvento(id) {
  await api.delete(`/agenda/${id}`);
}
