// iconosAgenda.js -> el catálogo de iconos para las actividades de la agenda.
// Cada entrada liga una CLAVE (lo que se guarda en la BD, campo "icono") con una
// etiqueta legible, un "tono" de color para el tile y una CATEGORÍA para agrupar
// el selector. Lo comparten la vista de agenda, el modal de edición y el
// calendario de actividades a largo plazo.

// Orden y etiqueta de cada grupo del selector. El calendario reusa las mismas
// categorías, así íconos y "tipos de actividad" hablan el mismo idioma.
export const CATEGORIAS_ICONOS = [
  { cat: 'rutina', label: 'Rutina diaria' },
  { cat: 'salud', label: 'Salud' },
  { cat: 'social', label: 'Social y familia' },
  { cat: 'salidas', label: 'Salidas y trámites' },
];

// Cada icono lleva una etiqueta larga (`label`, para el tooltip/lector de
// pantalla) y una corta (`corto`, la que se muestra debajo del icono en el
// selector, para que se entienda de un vistazo sin depender del "pasar el mouse").
export const ICONOS_AGENDA = [
  // rutina del día a día
  { key: 'cup', label: 'Desayuno / café / té', corto: 'Desayuno', tone: 'warn', cat: 'rutina' },
  { key: 'plate', label: 'Comida / almuerzo', corto: 'Comida', tone: 'warn', cat: 'rutina' },
  { key: 'bread', label: 'Once / pan', corto: 'Once', tone: 'warn', cat: 'rutina' },
  { key: 'drop', label: 'Aseo / baño', corto: 'Aseo', tone: 'accent', cat: 'rutina' },
  { key: 'bed', label: 'Descanso / siesta', corto: 'Descanso', tone: 'primary', cat: 'rutina' },
  { key: 'walk', label: 'Caminata', corto: 'Caminata', tone: 'accent', cat: 'rutina' },
  { key: 'puzzle', label: 'Juego', corto: 'Juego', tone: 'primary', cat: 'rutina' },
  { key: 'sun', label: 'Despertar', corto: 'Despertar', tone: 'warn', cat: 'rutina' },
  { key: 'moon', label: 'Dormir', corto: 'Dormir', tone: 'primary', cat: 'rutina' },
  // salud
  { key: 'pill', label: 'Medicación / remedios', corto: 'Remedios', tone: 'primary', cat: 'salud' },
  { key: 'heartpulse', label: 'Control médico', corto: 'Médico', tone: 'primary', cat: 'salud' },
  { key: 'tooth', label: 'Dentista', corto: 'Dentista', tone: 'primary', cat: 'salud' },
  { key: 'syringe', label: 'Vacuna / inyección', corto: 'Vacuna', tone: 'primary', cat: 'salud' },
  // social y familia
  { key: 'phone', label: 'Llamada', corto: 'Llamada', tone: 'accent', cat: 'social' },
  { key: 'heart', label: 'Visita familiar', corto: 'Visita', tone: 'accent', cat: 'social' },
  { key: 'gift', label: 'Cumpleaños', corto: 'Cumpleaños', tone: 'warn', cat: 'social' },
  { key: 'church', label: 'Misa / iglesia', corto: 'Misa', tone: 'accent', cat: 'social' },
  { key: 'book', label: 'Taller / centro de madres', corto: 'Taller', tone: 'primary', cat: 'social' },
  // salidas y trámites
  { key: 'tree', label: 'Paseo / parque', corto: 'Paseo', tone: 'accent', cat: 'salidas' },
  { key: 'cart', label: 'Compras / feria', corto: 'Compras', tone: 'warn', cat: 'salidas' },
  { key: 'bank', label: 'Trámite / banco', corto: 'Trámite', tone: 'primary', cat: 'salidas' },
  { key: 'scissors', label: 'Peluquería', corto: 'Peluquería', tone: 'accent', cat: 'salidas' },
];

// tono de color de una clave de icono (si no está en el catálogo, "primary")
export function toneDeIcono(key) {
  const encontrado = ICONOS_AGENDA.find((i) => i.key === key);
  return encontrado ? encontrado.tone : 'primary';
}

// los íconos de una categoría, en el orden del catálogo
export function iconosDeCategoria(cat) {
  return ICONOS_AGENDA.filter((i) => i.cat === cat);
}

// La agenda guarda la hora como fecha en UTC (1970-01-01T08:30Z). Acá saco el
// "HH:MM" de forma estable, sin que la zona horaria del navegador lo corra.
export function horaDeISO(iso) {
  return new Date(iso).toISOString().slice(11, 16);
}
