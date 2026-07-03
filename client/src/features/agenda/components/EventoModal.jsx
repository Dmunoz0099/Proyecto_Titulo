// EventoModal.jsx -> el diálogo para crear o editar una actividad de la agenda.
// Solo lo usa el CUIDADOR. Elige hora, título, detalle e icono.

import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon.jsx';
import { ICONOS_AGENDA, horaDeISO } from '../iconosAgenda.js';

function EventoModal({ inicial, onCerrar, onGuardar, guardando }) {
  const editando = !!inicial;

  // si estoy editando, la hora viene como fecha ISO -> la paso a "HH:MM"
  const [hora, setHora] = useState(inicial ? horaDeISO(inicial.hora) : '09:00');
  const [titulo, setTitulo] = useState(inicial?.titulo || '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion || '');
  const [icono, setIcono] = useState(inicial?.icono || 'cup');

  const puedeGuardar = titulo.trim() !== '' && hora !== '';

  function enviar() {
    if (!puedeGuardar) return;
    onGuardar({
      hora,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      icono,
    });
  }

  return (
    <div className="scrim" onClick={onCerrar}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editando ? 'Editar actividad' : 'Nueva actividad'}
      >
        <div className="modal-head">
          <h2 className="t-h2">{editando ? 'Editar actividad' : 'Nueva actividad'}</h2>
          <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label htmlFor="e-hora">Hora</label>
              <input
                id="e-hora"
                type="time"
                className="control"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="e-titulo">Actividad</label>
              <input
                id="e-titulo"
                className="control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Caminata"
                autoFocus
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="e-desc">Detalle (opcional)</label>
            <input
              id="e-desc"
              className="control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: una vuelta por el parque"
            />
          </div>

          <div className="field">
            <label>Icono</label>
            <div className="icon-pick">
              {ICONOS_AGENDA.map((ic) => (
                <button
                  key={ic.key}
                  type="button"
                  className={icono === ic.key ? 'on' : ''}
                  onClick={() => setIcono(ic.key)}
                  title={ic.label}
                  aria-label={ic.label}
                  aria-pressed={icono === ic.key}
                >
                  <Icon name={ic.key} size={30} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!puedeGuardar || guardando}
            onClick={enviar}
          >
            {guardando ? 'Guardando…' : editando ? 'Guardar' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventoModal;
