// MedicamentosPage.jsx -> el módulo de Medicamentos, portado del prototipo
// "Medicamentos.html" (mismas pestañas, tarjetas y estilo) pero enchufado al
// backend real vía api/medicamentos.js.
// Pestañas:
//  - HOY: las tomas del día (armadas a partir del horario de cada remedio).
//    "Marcar como dada" registra un RegistroMedicamento.
//  - REMEDIOS: la lista; el CUIDADOR puede añadir, editar y eliminar.
//  - HISTORIAL: todas las tomas registradas, agrupadas por día.
// Permisos: añadir/editar/eliminar solo CUIDADOR; marcar toma el CUIDADOR o el
// PACIENTE; el FAMILIAR solo consulta.

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AppBar } from '../../components/layout/AppBar.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import {
  listarMedicamentos,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento,
  registrarToma,
  listarTomas,
} from '../../api/medicamentos.js';
import MedicamentoModal from './components/MedicamentoModal.jsx';
import './Medicamentos.css';

// tonos que voy rotando por medicamento (el modelo no guarda color; así cada
// remedio se ve distinto, como en el prototipo)
const TONOS = ['primary', 'accent', 'warn'];

// saca las horas "HH:MM" de un horario en texto libre
function horasDeTexto(texto = '') {
  return (texto.match(/([01]?\d|2[0-3]):[0-5]\d/g) || []).map((h) =>
    h.length === 4 ? `0${h}` : h
  );
}

// momento del día según una hora "HH:MM"
function franja(time) {
  const h = parseInt(time, 10);
  if (Number.isNaN(h)) return '';
  return h < 12 ? 'mañana' : h < 19 ? 'tarde' : 'noche';
}

// "HH:MM" de una fecha ISO (hora local)
function horaCorta(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ¿la fecha ISO es de hoy?
function esHoy(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

// etiqueta legible de un día (Hoy / Ayer / fecha larga)
function etiquetaDia(fechaToString) {
  const dia = new Date(fechaToString);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (dia.toDateString() === hoy.toDateString()) {
    return `Hoy, ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
  }
  if (dia.toDateString() === ayer.toDateString()) {
    return `Ayer, ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
  }
  return dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

// badge con el estado de una toma
function StatusBadge({ administrado }) {
  return administrado ? (
    <span className="badge badge-ok"><span className="blip" />Administrada</span>
  ) : (
    <span className="badge badge-danger"><span className="blip" />No tomada</span>
  );
}

/* pestaña HOY */
function TodayTab({ medicamentos, tomasHoy, toneDe, puedeMarcar, esPaciente, marcandoKey, onMarcar }) {
  // armo las tomas del día a partir del horario de cada remedio
  const doses = [];
  medicamentos.forEach((m) => {
    const horas = horasDeTexto(m.horario);
    const lista = horas.length ? horas : [m.horario];
    lista.forEach((time) => doses.push({ key: `${m.id}-${time}`, med: m, time }));
  });
  doses.sort((a, b) => a.time.localeCompare(b.time));

  const tomaDe = (medId, time) =>
    tomasHoy.find((t) => t.medicamentoId === medId && t.comentario === time && t.administrado);

  if (doses.length === 0) {
    return <div className="card empty t-lg">No hay tomas programadas para hoy.</div>;
  }

  return (
    <div>
      {doses.map((d) => {
        const toma = tomaDe(d.med.id, d.time);
        const done = !!toma;
        return (
          <div key={d.key} className={`card dose ${done ? 'done' : ''}`}>
            <div className="when">
              <div className="hr">{d.time}</div>
              <div className="mer">{franja(d.time)}</div>
            </div>
            <div className="divider" />
            <span className={`tile tile-${toneDe(d.med.id)}`}><Icon name="pill" size={32} /></span>
            <div className="info">
              <div className="name">{d.med.nombre}</div>
              <div className="dosage">{d.med.dosis}</div>
            </div>
            <div className="action">
              {done ? (
                <div className="administered">
                  <span className="ring"><Icon name="check" size={26} stroke={3} /></span>
                  {esPaciente ? 'Tomada' : 'Dada'} {horaCorta(toma.fechaHora)}
                </div>
              ) : puedeMarcar ? (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => onMarcar(d.med, d.time)}
                  disabled={marcandoKey === d.key}
                >
                  <Icon name="check" size={26} stroke={2.5} />
                  {marcandoKey === d.key
                    ? 'Registrando…'
                    : esPaciente
                    ? 'Marcar como tomada'
                    : 'Marcar como dada'}
                </button>
              ) : (
                <span className="badge badge-warn"><span className="blip" />Pendiente</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* pestaña REMEDIOS */
function MedsTab({ medicamentos, toneDe, esCuidador, onEditar, onAgregar }) {
  if (medicamentos.length === 0) {
    return (
      <div className="card empty t-lg">
        Todavía no hay medicamentos.
        {esCuidador && ' Usa “Añadir medicamento” para registrar el primero.'}
      </div>
    );
  }
  return (
    <div>
      {medicamentos.map((m) => (
        <div key={m.id} className="card med">
          <span className={`tile tile-${toneDe(m.id)}`}><Icon name="pill" size={32} /></span>
          <div className="info">
            <div className="name">
              {m.nombre} <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>· {m.dosis}</span>
            </div>
            <div className="meta">
              <span className="m"><Icon name="clock" size={20} /> {m.horario}</span>
              {m.observaciones && (
                <span className="m"><Icon name="list" size={20} /> {m.observaciones}</span>
              )}
            </div>
          </div>
          {esCuidador && (
            <button className="btn btn-secondary" onClick={() => onEditar(m)}>
              <Icon name="edit" size={22} /> Editar
            </button>
          )}
        </div>
      ))}
      {esCuidador && (
        <button
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: 'var(--sp-2)' }}
          onClick={onAgregar}
        >
          <Icon name="plus" size={26} stroke={2.5} /> Añadir medicamento
        </button>
      )}
    </div>
  );
}

/* pestaña HISTORIAL */
function HistoryTab({ medicamentos, tomas, toneDe }) {
  const porId = Object.fromEntries(medicamentos.map((m) => [m.id, m]));

  // agrupo las tomas por día
  const porDia = {};
  tomas.forEach((t) => {
    const clave = new Date(t.fechaHora).toDateString();
    (porDia[clave] = porDia[clave] || []).push(t);
  });
  const dias = Object.keys(porDia)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((clave) => ({
      clave,
      etiqueta: etiquetaDia(clave),
      rows: porDia[clave].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)),
    }));

  if (dias.length === 0) {
    return <div className="card empty t-lg">Aún no hay tomas registradas.</div>;
  }

  return (
    <div>
      {dias.map((d) => (
        <div key={d.clave}>
          <h3 className="hist-day">{d.etiqueta}</h3>
          {d.rows.map((r) => {
            const m = porId[r.medicamentoId];
            return (
              <div key={r.id} className="card hrow">
                <div className="time">{horaCorta(r.fechaHora)}</div>
                <span
                  className={`tile tile-${m ? toneDe(m.id) : 'primary'}`}
                  style={{ width: 46, height: 46 }}
                >
                  <Icon name="pill" size={24} />
                </span>
                <div className="info">
                  <div className="name">
                    {m ? `${m.nombre} · ${m.dosis}` : 'Medicamento'}
                  </div>
                  <div className="by">
                    {r.administrado
                      ? `Administrada por ${r.registradoPor?.nombre || 'alguien'}`
                      : 'No registrada'}
                    {r.comentario ? ` · ${r.comentario}` : ''}
                  </div>
                </div>
                <StatusBadge administrado={r.administrado} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* la página */
function MedicamentosPage() {
  const { usuario } = useAuth();
  const esCuidador = usuario.rol === 'CUIDADOR';
  const esPaciente = usuario.rol === 'PACIENTE';
  const puedeMarcar = usuario.rol === 'CUIDADOR' || usuario.rol === 'PACIENTE';

  const [tab, setTab] = useState('hoy');
  const [medicamentos, setMedicamentos] = useState([]);
  const [tomas, setTomas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [marcandoKey, setMarcandoKey] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modal, setModal] = useState(null); // null | {} (nuevo) | med (editando)

  // tone fijo según la posición del medicamento en la lista
  const toneDe = (medId) => {
    const i = medicamentos.findIndex((m) => m.id === medId);
    return TONOS[(i < 0 ? 0 : i) % TONOS.length];
  };

  // trae las tomas en una sola petición (no bloquea la lista)
  async function recargarTomas() {
    try {
      setTomas(await listarTomas());
    } catch {
      // si fallan las tomas, la lista de remedios igual se ve; no muestro error duro por esto
    }
  }

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      // muestro los medicamentos apenas llegan (rápido)...
      const meds = await listarMedicamentos();
      setMedicamentos(meds);
      setCargando(false);
      // ...y las tomas se cargan de fondo (para "Hoy" e Historial)
      recargarTomas();
    } catch {
      setError('No pudimos cargar los medicamentos. Inténtalo de nuevo.');
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
        await actualizarMedicamento(modal.id, datos);
        setConfirmacion('Medicamento actualizado.');
      } else {
        await crearMedicamento(datos);
        setConfirmacion('Medicamento añadido.');
      }
      setModal(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar el medicamento.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(med) {
    const ok = window.confirm(`¿Quitar "${med.nombre}" de la lista de medicamentos?`);
    if (!ok) return;
    setError('');
    try {
      await eliminarMedicamento(med.id);
      setConfirmacion(`"${med.nombre}" se quitó de la lista.`);
      setModal(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar el medicamento.');
    }
  }

  async function marcar(med, time) {
    setMarcandoKey(`${med.id}-${time}`);
    setError('');
    try {
      // guardo la franja (time) en el comentario para saber qué toma del día se dio
      await registrarToma(med.id, { administrado: true, comentario: time });
      await recargarTomas();
      setConfirmacion(`Toma de ${med.nombre} (${time}) registrada. ¡Bien hecho!`);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos registrar la toma.');
    } finally {
      setMarcandoKey(null);
    }
  }

  const tomasHoy = tomas.filter((t) => esHoy(t.fechaHora));
  // tomas del día que siguen pendientes (para el contador de la pestaña Hoy)
  const pendientes = (() => {
    let n = 0;
    medicamentos.forEach((m) => {
      const horas = horasDeTexto(m.horario);
      const lista = horas.length ? horas : [m.horario];
      lista.forEach((time) => {
        const hecha = tomasHoy.find(
          (t) => t.medicamentoId === m.id && t.comentario === time && t.administrado
        );
        if (!hecha) n += 1;
      });
    });
    return n;
  })();

  return (
    <div className="page">
      <AppBar volver="/" />

      <main className="container">
        <div className="head-row">
          <div>
            <h1 className="t-h1">Medicamentos</h1>
            <div className="sub">El cuidado de los remedios, paso a paso.</div>
          </div>
          {esCuidador && (
            <button className="btn btn-primary btn-lg" onClick={() => setModal({})}>
              <Icon name="plus" size={26} stroke={2.5} /> Añadir medicamento
            </button>
          )}
        </div>

        {confirmacion && (
          <div className="aviso aviso-ok" role="status">
            <Icon name="check" size={24} stroke={2.5} />
            <span>{confirmacion}</span>
            <button className="aviso-x" onClick={() => setConfirmacion('')} aria-label="Cerrar aviso">
              <Icon name="x" size={20} />
            </button>
          </div>
        )}
        {error && (
          <div className="aviso aviso-error" role="alert">
            <Icon name="bell" size={24} />
            <span>{error}</span>
            <button className="aviso-x" onClick={() => setError('')} aria-label="Cerrar aviso">
              <Icon name="x" size={20} />
            </button>
          </div>
        )}

        <div className="tabs" role="tablist">
          <button className="tab" role="tab" aria-selected={tab === 'hoy'} onClick={() => setTab('hoy')}>
            <Icon name="clock" size={22} /> Hoy {pendientes > 0 && <span className="count">{pendientes}</span>}
          </button>
          <button className="tab" role="tab" aria-selected={tab === 'remedios'} onClick={() => setTab('remedios')}>
            <Icon name="list" size={22} /> Remedios
          </button>
          <button className="tab" role="tab" aria-selected={tab === 'historial'} onClick={() => setTab('historial')}>
            <Icon name="history" size={22} /> Historial
          </button>
        </div>

        {cargando ? (
          <p className="t-lg muted">Cargando medicamentos…</p>
        ) : (
          <>
            {tab === 'hoy' && (
              <TodayTab
                medicamentos={medicamentos}
                tomasHoy={tomasHoy}
                toneDe={toneDe}
                puedeMarcar={puedeMarcar}
                esPaciente={esPaciente}
                marcandoKey={marcandoKey}
                onMarcar={marcar}
              />
            )}
            {tab === 'remedios' && (
              <MedsTab
                medicamentos={medicamentos}
                toneDe={toneDe}
                esCuidador={esCuidador}
                onEditar={(m) => setModal(m)}
                onAgregar={() => setModal({})}
              />
            )}
            {tab === 'historial' && (
              <HistoryTab medicamentos={medicamentos} tomas={tomas} toneDe={toneDe} />
            )}
          </>
        )}
      </main>

      {modal !== null && (
        <MedicamentoModal
          inicial={modal.id ? modal : null}
          onCerrar={() => setModal(null)}
          onGuardar={guardar}
          onEliminar={eliminar}
          guardando={guardando}
        />
      )}
    </div>
  );
}

export default MedicamentosPage;
