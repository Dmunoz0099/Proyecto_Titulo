// api/vinculacion.js -> llamadas para asociar la cuenta a un adulto mayor.
// Como el resto, pasan por la instancia central de Axios (que pega el token solo).

import api from './axios.js';

// ¿la cuenta ya está vinculada? Devuelve { vinculado, rol, adultoMayor, codigo }.
export async function obtenerEstado() {
  const { data } = await api.get('/vinculacion/estado');
  return data;
}

// el cuidador crea al adulto mayor. Devuelve { usuario, token, adultoMayor, codigo }.
export async function crearPaciente(datos) {
  const { data } = await api.post('/vinculacion/paciente', datos);
  return data;
}

// unirse a un adulto mayor con el código. Devuelve { usuario, token, adultoMayor }.
export async function unirConCodigo(codigo) {
  const { data } = await api.post('/vinculacion/unir', { codigo });
  return data;
}

// el cuidador crea la cuenta del paciente (usuario + PIN de 4 números, sin correo).
// Devuelve { usuario } (el cuidador NO cambia de sesión).
export async function crearCuentaPaciente(datos) {
  const { data } = await api.post('/vinculacion/cuenta-paciente', datos);
  return data;
}

// el cuidador cambia el PIN del paciente. Devuelve { ok, nombreUsuario }.
export async function cambiarPinPaciente(pin) {
  const { data } = await api.post('/vinculacion/pin-paciente', { pin });
  return data;
}
