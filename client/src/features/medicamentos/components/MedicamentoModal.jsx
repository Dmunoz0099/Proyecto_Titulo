// MedicamentoModal.jsx -> el diálogo para crear o editar un medicamento (solo
// CUIDADOR). Copia del modal del prototipo "Medicamentos.html": nombre, dosis,
// horarios por "chips" e indicaciones. Si edita, también deja eliminar. El horario
// se guarda como texto unido por " · " (el backend lo guarda tal cual).

import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon.jsx';

// franjas horarias disponibles (las mismas del prototipo)
const SLOTS = ['08:00', '11:00', '14:00', '18:00', '21:00'];

// saca las horas "HH:MM" de un horario en texto libre
function horasDeTexto(texto = '') {
  return (texto.match(/([01]?\d|2[0-3]):[0-5]\d/g) || []).map((h) =>
    h.length === 4 ? `0${h}` : h
  );
}

function MedicamentoModal({ inicial, onCerrar, onGuardar, onEliminar, guardando }) {
  const editando = !!inicial;

  const [nombre, setNombre] = useState(inicial?.nombre || '');
  const [dosis, setDosis] = useState(inicial?.dosis || '');
  const [times, setTimes] = useState(
    inicial ? horasDeTexto(inicial.horario) : ['08:00']
  );
  const [observaciones, setObservaciones] = useState(inicial?.observaciones || '');

  const toggle = (t) =>
    setTimes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t].sort()));

  const puedeGuardar = nombre.trim() !== '' && dosis.trim() !== '' && times.length > 0;

  function enviar() {
    if (!puedeGuardar) return;
    onGuardar({
      nombre: nombre.trim(),
      dosis: dosis.trim(),
      horario: times.join(' · '),
      observaciones: observaciones.trim(),
    });
  }

  return (
    <div className="scrim" onClick={onCerrar}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editando ? 'Editar medicamento' : 'Nuevo medicamento'}
      >
        <div className="modal-head">
          <h2 className="t-h2">{editando ? 'Editar medicamento' : 'Nuevo medicamento'}</h2>
          <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="m-nombre">Nombre del remedio</label>
            <input
              id="m-nombre"
              className="control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Enalapril"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="m-dosis">Dosis</label>
            <input
              id="m-dosis"
              className="control"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              placeholder="Ej: 10 mg"
            />
          </div>

          <div className="field">
            <label>Horarios</label>
            <div className="time-chips">
              {SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`time-chip ${times.includes(t) ? 'on' : ''}`}
                  onClick={() => toggle(t)}
                  aria-pressed={times.includes(t)}
                >
                  {times.includes(t) && <Icon name="check" size={18} stroke={3} />} {t}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="m-obs">Indicaciones (opcional)</label>
            <input
              id="m-obs"
              className="control"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: tomar con el desayuno"
            />
          </div>
        </div>

        <div className="modal-foot">
          {editando && (
            <button className="btn btn-danger" onClick={() => onEliminar(inicial)}>
              <Icon name="trash" size={22} /> Eliminar
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!puedeGuardar || guardando} onClick={enviar}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicamentoModal;
