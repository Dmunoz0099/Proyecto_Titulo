// calendarioFechas.js -> utilidades de fecha del Calendario. El backend guarda la
// fecha como "reloj de pared" en UTC (mismo criterio que la agenda), así que para
// leerla SIEMPRE uso UTC y no se corre por la zona horaria del navegador.

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export { DIAS_SEMANA, MESES };

// ISO del backend -> "YYYY-MM-DD" (en UTC, estable)
export function ymdDeISO(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

// ISO del backend -> "HH:MM" (en UTC, estable)
export function horaDeISO(iso) {
  return new Date(iso).toISOString().slice(11, 16);
}

// year, month(0-11), day -> "YYYY-MM-DD"
export function aYMD(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// hoy en el calendario del usuario (fecha local) como "YYYY-MM-DD"
export function hoyYMD() {
  const h = new Date();
  return aYMD(h.getFullYear(), h.getMonth(), h.getDate());
}

// "YYYY-MM-DD" -> texto largo (ej: "miércoles, 15 de octubre")
export function ymdLargo(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  // uso mediodía UTC para que el nombre del día no se corra por la zona
  const fecha = new Date(Date.UTC(y, m - 1, d, 12));
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

// "YYYY-MM-DD" -> texto corto (ej: "15 oct")
export function ymdCorto(ymd) {
  const [, m, d] = ymd.split('-').map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

// arma la grilla del mes: una matriz de semanas (Lun→Dom). Cada celda es null
// (relleno de otro mes) o un número de día. Semana arranca el lunes.
export function grillaDelMes(year, month) {
  const primerDia = new Date(year, month, 1);
  // getDay(): 0=Dom..6=Sáb. Lo reindexo a 0=Lun..6=Dom.
  const offset = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) {
    semanas.push(celdas.slice(i, i + 7));
  }
  return semanas;
}
