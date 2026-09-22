// EventoCalendarioModal.jsx -> diálogo para crear o editar un evento del
// calendario a largo plazo. Solo lo usa el CUIDADOR. Igual que el de la agenda,
// pero con FECHA (día concreto) además de la hora.

import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon.jsx';
import { CampoHora } from '../../../components/ui/CampoHora.jsx';
import {
  CATEGORIAS_ICONOS,
  iconosDeCategoria,
} from '../../agenda/iconosAgenda.js';
import { ymdDeISO, horaDeISO } from '../calendarioFechas.js';

function EventoCalendarioModal({
  inicial,
  fechaInicial,
  onCerrar,
  onGuardar,
  guardando,
}) {
  const editando = !!inicial;

  // al editar, la fecha viene como ISO -> la parto en "YYYY-MM-DD" y "HH:MM".
  // al crear, uso el día que se tocó en la grilla (fechaInicial) si viene.
  const [fecha, setFecha] = useState(
    inicial ? ymdDeISO(inicial.fecha) : fechaInicial || ''
  );
  const [hora, setHora] = useState(inicial ? horaDeISO(inicial.fecha) : '10:00');
  const [titulo, setTitulo] = useState(inicial?.titulo || '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion || '');
  const [icono, setIcono] = useState(inicial?.icono || 'heartpulse');

  const puedeGuardar = titulo.trim() !== '' && fecha !== '';

  function enviar() {
    if (!puedeGuardar) return;
    onGuardar({
      fecha,
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
        aria-label={editando ? 'Editar evento' : 'Nuevo evento'}
      >
        <div className="modal-head">
          <h2 className="t-h2">{editando ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label htmlFor="c-fecha">Fecha</label>
              <input
                id="c-fecha"
                type="date"
                className="control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="c-hora">Hora</label>
              <CampoHora id="c-hora" value={hora} onChange={setHora} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="c-titulo">Actividad</label>
            <input
              id="c-titulo"
              className="control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Control médico"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="c-desc">Detalle (opcional)</label>
            <input
              id="c-desc"
              className="control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Consultorio, llevar carnet"
            />
          </div>

          <div className="field">
            <label>Icono</label>
            {CATEGORIAS_ICONOS.map((grupo) => (
              <div key={grupo.cat} className="icon-grupo">
                <div className="icon-grupo-titulo muted">{grupo.label}</div>
                <div className="icon-pick">
                  {iconosDeCategoria(grupo.cat).map((ic) => (
                    <button
                      key={ic.key}
                      type="button"
                      className={icono === ic.key ? 'on' : ''}
                      onClick={() => setIcono(ic.key)}
                      title={ic.label}
                      aria-label={ic.label}
                      aria-pressed={icono === ic.key}
                    >
                      <Icon name={ic.key} size={28} />
                      <span className="cap">{ic.corto || ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
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

export default EventoCalendarioModal;
