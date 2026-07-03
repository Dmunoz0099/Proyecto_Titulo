// api/alertas.js -> llamadas a los endpoints de alertas SOS.
// Usan la instancia central de Axios (que ya pone el token). Los componentes
// pasan por acá, no por axios directo.
// Recordatorio de permisos: crear -> solo PACIENTE; listar/atender -> CUIDADOR o FAMILIAR.

import api from './axios.js';

// el PACIENTE pide ayuda. mensaje opcional. Devuelve la alerta creada.
export async function crearAlerta(datos = {}) {
  const { data } = await api.post('/alertas', datos);
  return data;
}

// CUIDADOR/FAMILIAR: lista las alertas (pendientes primero). Cada una trae
// quién la generó y quién la atendió.
export async function listarAlertas() {
  const { data } = await api.get('/alertas');
  return data;
}

// CUIDADOR/FAMILIAR: marca una alerta como atendida. Devuelve la alerta.
export async function atenderAlerta(id) {
  const { data } = await api.post(`/alertas/${id}/atender`);
  return data;
}
