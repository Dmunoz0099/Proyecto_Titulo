// CalendarioPage.jsx -> el Calendario a largo plazo: horas médicas, centro de
// madres, paseos del barrio, cumpleaños, trámites... Complementa a la Agenda
// (que es la rutina DIARIA). Acá cada evento tiene una FECHA concreta.
//  - Vista PACIENTE / FAMILIAR: "Próximas actividades", una lista grande y clara.
//  - Vista CUIDADOR: gestiona con una grilla mensual (crear/editar/eliminar) y
//    puede previsualizar la vista simple con el selector.
// El rol manda igual que en la agenda: solo el CUIDADOR gestiona.

import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AppBar } from '../../components/layout/AppBar.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import {
  listarEventosCalendario,
  crearEventoCalendario,
  actualizarEventoCalendario,
  eliminarEventoCalendario,
} from '../../api/calendario.js';
import { useRecurso } from '../../api/cache.js';
import { toneDeIcono } from '../agenda/iconosAgenda.js';
import {
  DIAS_SEMANA,
  MESES,
  ymdDeISO,
  horaDeISO,
  aYMD,
  hoyYMD,
  ymdLargo,
  grillaDelMes,
} from './calendarioFechas.js';
import EventoCalendarioModal from './components/EventoCalendarioModal.jsx';
import { DialogoConfirmar } from '../../components/ui/DialogoConfirmar.jsx';
import './Calendario.css';

// agrupa los eventos por día "YYYY-MM-DD" (para pintar la grilla y las listas)
function agruparPorDia(eventos) {
  const mapa = new Map();
  for (const e of eventos) {
    const ymd = ymdDeISO(e.fecha);
    if (!mapa.has(ymd)) mapa.set(ymd, []);
    mapa.get(ymd).push(e);
  }
  // cada día ordenado por hora
  for (const lista of mapa.values()) {
    lista.sort((a, b) => horaDeISO(a.fecha).localeCompare(horaDeISO(b.fecha)));
  }
  return mapa;
}

/* fila de un evento (icono + título + hora), reutilizada en las listas */
function FilaEvento({ e, acciones, onEditar, onEliminar }) {
  return (
    <div className="card cal-ev">
      <span className={`tile tile-${toneDeIcono(e.icono)}`}>
        <Icon name={e.icono || 'calendar'} size={30} />
      </span>
      <div className="cal-ev-info">
        <div className="cal-ev-title">{e.titulo}</div>
        {e.descripcion && <div className="cal-ev-desc">{e.descripcion}</div>}
      </div>
      <div className="cal-ev-hora">{horaDeISO(e.fecha)}</div>
      {acciones && (
        <div className="cal-ev-acts">
          <button className="icon-btn" aria-label={`Editar ${e.titulo}`} onClick={() => onEditar(e)}>
            <Icon name="edit" size={22} />
          </button>
          <button className="icon-btn" aria-label={`Eliminar ${e.titulo}`} onClick={() => onEliminar(e)}>
            <Icon name="trash" size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

/* vista PACIENTE / FAMILIAR: próximas actividades (desde hoy en adelante) */
function VistaProximos({ eventos }) {
  const hoy = hoyYMD();
  const proximos = eventos
    .filter((e) => ymdDeISO(e.fecha) >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div>
      <div className="cal-head-simple">
        <div className="title">Próximas actividades</div>
        <div className="sub muted">Lo que viene: controles, salidas y visitas.</div>
      </div>

      {proximos.length === 0 ? (
        <div className="card empty t-lg">No hay actividades próximas anotadas.</div>
      ) : (
        <div className="cal-lista">
          {proximos.map((e) => (
            <div key={e.id} className="cal-prox-item">
              <div className="cal-prox-fecha">
                <Icon name="calendar" size={22} />
                <span>{ymdLargo(ymdDeISO(e.fecha))}</span>
              </div>
              <FilaEvento e={e} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* vista CUIDADOR: grilla mensual + eventos del día elegido */
function VistaCuidador({
  eventos,
  year,
  month,
  onMes,
  diaSel,
  onDia,
  onNuevo,
  onEditar,
  onEliminar,
}) {
  const porDia = useMemo(() => agruparPorDia(eventos), [eventos]);
  const semanas = useMemo(() => grillaDelMes(year, month), [year, month]);
  const hoy = hoyYMD();
  const eventosDelDia = porDia.get(diaSel) || [];

  return (
    <div>
      <div className="head-row">
        <div>
          <h1 className="t-h1">Calendario</h1>
          <div className="sub">Horas médicas, paseos, trámites y fechas importantes.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => onNuevo(diaSel)}>
          <Icon name="plus" size={26} stroke={2.5} /> Añadir evento
        </button>
      </div>

      <div className="card cal-cal">
        <div className="cal-nav">
          <button className="icon-btn" aria-label="Mes anterior" onClick={() => onMes(-1)}>
            <Icon name="chevronLeft" size={26} />
          </button>
          <div className="cal-mes" aria-live="polite">
            {MESES[month]} {year}
          </div>
          <button className="icon-btn" aria-label="Mes siguiente" onClick={() => onMes(1)}>
            <Icon name="chevronRight" size={26} />
          </button>
        </div>

        <div className="cal-grid" role="grid" aria-label={`${MESES[month]} ${year}`}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="cal-dow" role="columnheader">{d}</div>
          ))}
          {semanas.flat().map((dia, i) => {
            if (dia === null) return <div key={`v-${i}`} className="cal-dia vacio" />;
            const ymd = aYMD(year, month, dia);
            const delDia = porDia.get(ymd) || [];
            const clases = [
              'cal-dia',
              ymd === hoy ? 'hoy' : '',
              ymd === diaSel ? 'sel' : '',
              delDia.length ? 'con-eventos' : '',
            ].filter(Boolean).join(' ');
            return (
              <button
                key={ymd}
                type="button"
                className={clases}
                onClick={() => onDia(ymd)}
                aria-pressed={ymd === diaSel}
                aria-label={`${dia}${delDia.length ? `, ${delDia.length} evento${delDia.length === 1 ? '' : 's'}` : ''}`}
              >
                <span className="cal-num">{dia}</span>
                {delDia.length > 0 && (
                  <span className="cal-puntos">
                    {delDia.slice(0, 3).map((e) => (
                      <span key={e.id} className={`punto punto-${toneDeIcono(e.icono)}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="cal-dia-sel">
        <h2 className="t-h2">{ymdLargo(diaSel)}</h2>
        {eventosDelDia.length === 0 ? (
          <div className="card empty">
            No hay eventos este día. Usa “Añadir evento” para anotar uno.
          </div>
        ) : (
          <div className="cal-lista">
            {eventosDelDia.map((e) => (
              <FilaEvento
                key={e.id}
                e={e}
                acciones
                onEditar={onEditar}
                onEliminar={onEliminar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* la página */
function CalendarioPage() {
  const { usuario } = useAuth();
  const esCuidador = usuario.rol === 'CUIDADOR';

  const [view, setView] = useState(esCuidador ? 'cuidador' : 'paciente');
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [diaSel, setDiaSel] = useState(hoyYMD());
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [modal, setModal] = useState(null); // null | {fechaInicial} (nuevo) | evento (editar)
  const [porBorrar, setPorBorrar] = useState(null);

  // los eventos del calendario van por la caché compartida ('eventosCalendario'):
  // la misma key la usa la Home y la campana, así crear/editar acá se refleja solo.
  const {
    datos: eventos,
    cargando,
    refrescar: refrescarEventos,
  } = useRecurso('eventosCalendario', listarEventosCalendario, { inicial: [] });

  // navegar de mes (delta -1 / +1), envolviendo año
  function cambiarMes(delta) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  async function guardar(datos) {
    setGuardando(true);
    setError('');
    try {
      if (modal && modal.id) {
        await actualizarEventoCalendario(modal.id, datos);
      } else {
        await crearEventoCalendario(datos);
      }
      setModal(null);
      await refrescarEventos();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar el evento.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(evento) {
    setGuardando(true);
    setError('');
    try {
      await eliminarEventoCalendario(evento.id);
      setPorBorrar(null);
      await refrescarEventos();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar el evento.');
    } finally {
      setGuardando(false);
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
          <p className="t-lg muted">Cargando calendario…</p>
        ) : esCuidador && view === 'cuidador' ? (
          <VistaCuidador
            eventos={eventos}
            year={year}
            month={month}
            onMes={cambiarMes}
            diaSel={diaSel}
            onDia={setDiaSel}
            onNuevo={(fecha) => setModal({ fechaInicial: fecha })}
            onEditar={(e) => setModal(e)}
            onEliminar={(e) => setPorBorrar(e)}
          />
        ) : (
          <VistaProximos eventos={eventos} />
        )}
      </main>

      {modal !== null && (
        <EventoCalendarioModal
          inicial={modal.id ? modal : null}
          fechaInicial={modal.fechaInicial}
          onCerrar={() => setModal(null)}
          onGuardar={guardar}
          guardando={guardando}
        />
      )}

      {porBorrar && (
        <DialogoConfirmar
          titulo="Eliminar evento"
          mensaje={`¿Eliminar el evento "${porBorrar.titulo}"?`}
          textoConfirmar="Sí, eliminar"
          procesando={guardando}
          onConfirmar={() => eliminar(porBorrar)}
          onCancelar={() => setPorBorrar(null)}
        />
      )}
    </div>
  );
}

export default CalendarioPage;
