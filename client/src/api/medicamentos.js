// api/medicamentos.js -> llamadas a los endpoints de medicamentos.
// Usan la instancia central de Axios. Los componentes pasan por acá, no por axios directo.

import api from './axios.js';

// medicamentos activos del adulto mayor del usuario
export async function listarMedicamentos() {
  const { data } = await api.get('/medicamentos');
  return data;
}

// crear (solo CUIDADOR). Devuelve el creado.
export async function crearMedicamento(datos) {
  const { data } = await api.post('/medicamentos', datos);
  return data;
}

// actualizar (solo CUIDADOR). Devuelve el actualizado.
export async function actualizarMedicamento(id, datos) {
  const { data } = await api.put(`/medicamentos/${id}`, datos);
  return data;
}

// eliminar (borrado lógico, solo CUIDADOR)
export async function eliminarMedicamento(id) {
  await api.delete(`/medicamentos/${id}`);
}

// registrar una toma. Devuelve el registro creado.
export async function registrarToma(id, datos = {}) {
  const { data } = await api.post(`/medicamentos/${id}/tomas`, datos);
  return data;
}

// historial de tomas de un medicamento
export async function obtenerHistorial(id) {
  const { data } = await api.get(`/medicamentos/${id}/tomas`);
  return data;
}

// todas las tomas del adulto mayor de una sola vez
export async function listarTomas() {
  const { data } = await api.get('/medicamentos/tomas');
  return data;
}
