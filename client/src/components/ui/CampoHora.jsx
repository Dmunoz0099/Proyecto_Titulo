// CampoHora.jsx -> selector de hora con dos listas (hora y minutos).
// Reemplaza al <input type="time"> nativo, cuyo desplegable en el escritorio se
// ve apretado y feo, y es chico para el adulto mayor. Recibe y entrega "HH:MM".

const HORAS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
const MINUTOS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function CampoHora({ id, value, onChange }) {
  const [h = '09', m = '00'] = (value || '').split(':');

  // si el minuto guardado no está en la lista (p. ej. una toma a las :07), lo
  // agrego para no perderlo al editar
  const minutos = MINUTOS.includes(m)
    ? MINUTOS
    : [...MINUTOS, m].sort();

  return (
    <div className="campo-hora">
      <select
        id={id}
        className="control"
        value={h}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
        aria-label="Hora"
      >
        {HORAS.map((hh) => (
          <option key={hh} value={hh}>{hh}</option>
        ))}
      </select>
      <span className="campo-hora-sep" aria-hidden="true">:</span>
      <select
        className="control"
        value={m}
        onChange={(e) => onChange(`${h}:${e.target.value}`)}
        aria-label="Minutos"
      >
        {minutos.map((mm) => (
          <option key={mm} value={mm}>{mm}</option>
        ))}
      </select>
    </div>
  );
}

export default CampoHora;
