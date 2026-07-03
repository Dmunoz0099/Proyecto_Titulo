// iconosAgenda.js -> el catálogo de iconos para las actividades de la agenda.
// Cada entrada liga una CLAVE (lo que se guarda en la BD, campo "icono") con una
// etiqueta legible y un "tono" de color para el tile. Lo comparten la vista de
// agenda y el modal de edición.

export const ICONOS_AGENDA = [
  { key: 'cup', label: 'Desayuno / café', tone: 'warn' },
  { key: 'pill', label: 'Medicación', tone: 'primary' },
  { key: 'walk', label: 'Caminata', tone: 'accent' },
  { key: 'plate', label: 'Comida', tone: 'warn' },
  { key: 'puzzle', label: 'Juego', tone: 'primary' },
  { key: 'phone', label: 'Llamada', tone: 'accent' },
  { key: 'drop', label: 'Aseo', tone: 'accent' },
  { key: 'bed', label: 'Descanso', tone: 'primary' },
  { key: 'sun', label: 'Mañana', tone: 'warn' },
  { key: 'moon', label: 'Noche', tone: 'primary' },
];

// tono de color de una clave de icono (si no está en el catálogo, "primary")
export function toneDeIcono(key) {
  const encontrado = ICONOS_AGENDA.find((i) => i.key === key);
  return encontrado ? encontrado.tone : 'primary';
}

// La agenda guarda la hora como fecha en UTC (1970-01-01T08:30Z). Acá saco el
// "HH:MM" de forma estable, sin que la zona horaria del navegador lo corra.
export function horaDeISO(iso) {
  return new Date(iso).toISOString().slice(11, 16);
}
