// AgendaPage.jsx -> el módulo de Agenda visual, portado del prototipo
// "Agenda.html" (mismas vistas, clases y estilo) pero enchufado al backend real
// vía api/agenda.js.
//  - Vista PACIENTE: "El día de hoy" en grande, por hora, con icono y título.
//    Resalta la actividad en curso.
//  - Vista CUIDADOR: gestiona las actividades (crear/editar/eliminar) y puede
//    previsualizar la vista del paciente con el selector.
// El rol manda: PACIENTE y FAMILIAR solo ven la vista grande; el CUIDADOR ve el selector.

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AppBar } from '../../components/layout/AppBar.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import {
  listarEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} from '../../api/agenda.js';
import { toneDeIcono, horaDeISO } from './iconosAgenda.js';
import EventoModal from './components/EventoModal.jsx';
import './Agenda.css';

// fecha de hoy en formato largo (ej: "viernes, 5 de junio")
function fechaLarga() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// hora del navegador como "HH:MM" (para resaltar el evento en curso)
function horaActual() {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/* vista del PACIENTE */
function PatientView({ eventos }) {
  const ahora = horaActual();
  // el evento "en curso" es el último cuya hora ya pasó
  let idxAhora = -1;
  eventos.forEach((e, i) => {
    if (horaDeISO(e.hora) <= ahora) idxAhora = i;
  });

  return (
    <div>
      <div className="pat-head">
        <div className="date">{fechaLarga()}</div>
        <div className="title">El día de hoy</div>
      </div>

      {eventos.length === 0 ? (
        <div className="card empty t-lg">Aún no hay actividades para hoy.</div>
      ) : (
        <div className="timeline">
          {eventos.map((e, i) => {
            const estado = i < idxAhora ? 'done' : i === idxAhora ? 'now' : 'next';
            return (
              <div key={e.id} className={`act ${estado}`}>
                <div className="time">{horaDeISO(e.hora)}</div>
                <span className={`tile tile-${toneDeIcono(e.icono)}`}>
                  <Icon name={e.icono || 'sun'} size={52} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="name">{e.titulo}</div>
                  {e.descripcion && <div className="desc">{e.descripcion}</div>}
                  {estado === 'now' && (
                    <span className="nowtag"><Icon name="bell" size={20} /> Ahora</span>
                  )}
                </div>
                {estado === 'done' && (
                  <span className="donemark"><Icon name="check" size={28} stroke={3} /> Hecho</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* vista del CUIDADOR */
function CaregiverView({ eventos, onNuevo, onEditar, onEliminar }) {
  return (
    <div>
      <div className="head-row">
        <div>
          <h1 className="t-h1">Agenda de hoy</h1>
          <div className="sub">Organiza la rutina. Se mostrará en grande en la vista del paciente.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onNuevo}>
          <Icon name="plus" size={26} stroke={2.5} /> Añadir actividad
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="card empty t-lg">
          Todavía no hay actividades. Usa “Añadir actividad” para empezar.
        </div>
      ) : (
        eventos.map((e) => (
          <div key={e.id} className="card ev">
            <div className="time">{horaDeISO(e.hora)}</div>
            <span className={`tile tile-${toneDeIcono(e.icono)}`}>
              <Icon name={e.icono || 'sun'} size={30} />
            </span>
            <div className="info">
              <div className="name">{e.titulo}</div>
              {e.descripcion && <div className="desc">{e.descripcion}</div>}
            </div>
            <div className="acts">
              <button className="icon-btn" aria-label={`Editar ${e.titulo}`} onClick={() => onEditar(e)}>
                <Icon name="edit" size={22} />
              </button>
              <button className="icon-btn" aria-label={`Eliminar ${e.titulo}`} onClick={() => onEliminar(e)}>
                <Icon name="trash" size={22} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* la página */
function AgendaPage() {
  const { usuario } = useAuth();
  const esCuidador = usuario.rol === 'CUIDADOR';

  // el cuidador puede alternar entre gestionar y previsualizar; los demás roles
  // ven directo la vista del paciente
  const [view, setView] = useState(esCuidador ? 'cuidador' : 'paciente');
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [modal, setModal] = useState(null); // null | {} (nuevo) | evento (editando)

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const datos = await listarEventos();
      setEventos(datos);
    } catch {
      setError('No pudimos cargar la agenda. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(datos) {
    setGuardando(true);
    setError('');
    try {
      if (modal && modal.id) {
        await actualizarEvento(modal.id, datos);
      } else {
        await crearEvento(datos);
      }
      setModal(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar la actividad.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(evento) {
    const ok = window.confirm(`¿Eliminar la actividad "${evento.titulo}"?`);
    if (!ok) return;
    setError('');
    try {
      await eliminarEvento(evento.id);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar la actividad.');
    }
  }

  return (
    <div className="page">
      <AppBar volver="/" />

      <main className="container">
        {error && (
          <div className="aviso aviso-error" role="alert">
            <Icon name="bell" size={24} />
            <span>{error}</span>
            <button className="aviso-x" onClick={() => setError('')} aria-label="Cerrar aviso">
              <Icon name="x" size={20} />
            </button>
          </div>
        )}

        {/* el selector de vistas solo lo ve el cuidador */}
        {esCuidador && (
          <div className="row" style={{ justifyContent: 'center', marginBottom: 'var(--sp-5)' }}>
            <div className="viewtoggle" role="group" aria-label="Cambiar vista">
              <button aria-pressed={view === 'paciente'} onClick={() => setView('paciente')}>
                <Icon name="user" size={22} /> Vista paciente
              </button>
              <button aria-pressed={view === 'cuidador'} onClick={() => setView('cuidador')}>
                <Icon name="users" size={22} /> Vista cuidador
              </button>
            </div>
          </div>
        )}

        {cargando ? (
          <p className="t-lg muted">Cargando agenda…</p>
        ) : esCuidador && view === 'cuidador' ? (
          <CaregiverView
            eventos={eventos}
            onNuevo={() => setModal({})}
            onEditar={(e) => setModal(e)}
            onEliminar={eliminar}
          />
        ) : (
          <PatientView eventos={eventos} />
        )}
      </main>

      {modal !== null && (
        <EventoModal
          inicial={modal.id ? modal : null}
          onCerrar={() => setModal(null)}
          onGuardar={guardar}
          guardando={guardando}
        />
      )}
    </div>
  );
}

export default AgendaPage;
