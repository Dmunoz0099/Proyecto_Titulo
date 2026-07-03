// Inicio.jsx -> la Home del portal. Copia del prototipo "Home.html": el saludo
// del día, un "vistazo de hoy" (próxima toma y siguiente actividad) y los accesos
// a los módulos. Mantengo estructura, clases y paleta del diseño, pero con datos
// reales del backend y los links a las rutas de la app.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AppBar } from '../components/layout/AppBar.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { listarMedicamentos } from '../api/medicamentos.js';
import { listarEventos } from '../api/agenda.js';
import { horaDeISO } from '../features/agenda/iconosAgenda.js';
import { BotonSOS } from '../features/alertas/BotonSOS.jsx';
import { PanelAlertas } from '../features/alertas/PanelAlertas.jsx';
import '../features/alertas/alertas.css';
import './Inicio.css';

// fecha de hoy en formato largo (ej: "viernes, 5 de junio")
function fechaLarga() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// hora actual "HH:MM" para elegir la "próxima" toma/actividad
function horaActual() {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// saca las horas "HH:MM" de un horario en texto libre
// (ej: "08:00 y 21:00" -> ["08:00", "21:00"])
function horasDeTexto(texto = '') {
  return (texto.match(/([01]?\d|2[0-3]):[0-5]\d/g) || []).map((h) =>
    h.length === 4 ? `0${h}` : h
  );
}

// tarjeta "Snap" del vistazo de hoy (igual que en Home.html)
function Snap({ tone, icon, label, main, time, to }) {
  return (
    <Link to={to} className="card snap">
      <span className={`tile tile-${tone}`}>
        <Icon name={icon} size={34} />
      </span>
      <div className="txt">
        <div className="lab">{label}</div>
        <div className="main">{main}</div>
        <div className="time">{time}</div>
      </div>
      <span className="go">
        <Icon name="chevronRight" size={28} />
      </span>
    </Link>
  );
}

// tarjeta de módulo: link si está activo, o bloque apagado si no
function Module({ tone, icon, name, desc, foot, to, disabled }) {
  const contenido = (
    <>
      <span className={`tile tile-${tone}`}>
        <Icon name={icon} size={44} />
      </span>
      <div>
        <div className="m-name">{name}</div>
        <div className="m-desc">{desc}</div>
      </div>
      <span className="m-foot">
        {foot} {!disabled && <Icon name="chevronRight" size={24} />}
      </span>
    </>
  );
  if (disabled) {
    return <div className="card module disabled" aria-disabled="true">{contenido}</div>;
  }
  return (
    <Link to={to} className="card module">
      {contenido}
    </Link>
  );
}

function Inicio() {
  const { usuario } = useAuth();
  // el PACIENTE ve su propio inicio (botón de ayuda y módulos simples); el
  // CUIDADOR/FAMILIAR ven el panel de alertas y los módulos de gestión. Cada
  // rol tiene opciones distintas.
  const esPaciente = usuario.rol === 'PACIENTE';
  const [proximaToma, setProximaToma] = useState(null);
  const [siguienteActividad, setSiguienteActividad] = useState(null);
  const [cargando, setCargando] = useState(true);

  // traigo el "vistazo de hoy" del backend. Si algo falla, muestro un texto
  // neutro (la Home nunca se rompe). Mientras tanto va un "Cargando…" para no
  // mostrar el texto de "vacío" antes de tiempo.
  useEffect(() => {
    const ahora = horaActual();

    const cargarMeds = listarMedicamentos()
      .then((meds) => {
        if (meds.length === 0) return;
        // elijo la toma cuya próxima hora sea la más cercana a "ahora"
        let mejor = null;
        for (const m of meds) {
          const horas = horasDeTexto(m.horario);
          const proxima = horas.find((h) => h >= ahora) || horas[0] || m.horario;
          if (!mejor || (proxima && proxima >= ahora && proxima < mejor.hora)) {
            mejor = { med: m, hora: proxima };
          }
        }
        if (!mejor) mejor = { med: meds[0], hora: horasDeTexto(meds[0].horario)[0] || meds[0].horario };
        setProximaToma(mejor);
      })
      .catch(() => {});

    const cargarEventos = listarEventos()
      .then((eventos) => {
        if (eventos.length === 0) return;
        const siguiente =
          eventos.find((e) => horaDeISO(e.hora) >= ahora) || eventos[0];
        setSiguienteActividad(siguiente);
      })
      .catch(() => {});

    // cuando terminan las dos (bien o mal), saco el estado de carga
    Promise.allSettled([cargarMeds, cargarEventos]).then(() =>
      setCargando(false)
    );
  }, []);

  return (
    <div className="page">
      <AppBar />

      <main className="container">
        <div className="hero">
          <div className="date">{fechaLarga()}</div>
          <h1 className="t-display">Hola, {usuario.nombre.split(' ')[0]}</h1>
          <p className="t-lg muted" style={{ maxWidth: '44ch', marginTop: 4 }}>
            {esPaciente
              ? 'Todo lo de hoy en un solo lugar. Tómate tu tiempo.'
              : 'Resumen del día y avisos. Aquí cuidas y acompañas.'}
          </p>
        </div>

        {/* paciente: su botón de ayuda. Cuidador/familiar: el panel de alertas */}
        {esPaciente ? <BotonSOS /> : <PanelAlertas />}

        {/* vistazo de hoy (igual para todos los roles) */}
        <div className="today">
          <Snap
            tone="primary"
            icon="pill"
            label="Próxima toma"
            main={cargando ? 'Cargando…' : proximaToma ? `${proximaToma.med.nombre} · ${proximaToma.med.dosis}` : 'Sin medicamentos'}
            time={cargando ? '' : proximaToma ? `Hoy a las ${proximaToma.hora}` : 'Aún no hay tomas'}
            to="/medicamentos"
          />
          <Snap
            tone="accent"
            icon="calendar"
            label="Siguiente actividad"
            main={cargando ? 'Cargando…' : siguienteActividad ? siguienteActividad.titulo : 'Sin actividades'}
            time={cargando ? '' : siguienteActividad ? `Hoy a las ${horaDeISO(siguienteActividad.hora)}` : 'Aún no hay actividades'}
            to="/agenda"
          />
        </div>

        <h2 className="section-title">
          {esPaciente ? '¿Qué quieres hacer?' : 'Gestión y seguimiento'}
        </h2>

        {esPaciente ? (
          // módulos del PACIENTE (simples y propios)
          <div className="modules">
            <Module
              tone="primary"
              icon="pill"
              name="Mis remedios"
              desc="Tus pastillas de hoy. Marca cada toma."
              foot="Abrir"
              to="/medicamentos"
            />
            <Module
              tone="accent"
              icon="calendar"
              name="Mi día"
              desc="Lo que toca hacer hoy, con calma y en orden."
              foot="Abrir"
              to="/agenda"
            />
            <Module
              tone="warn"
              icon="puzzle"
              name="Calma y juegos"
              desc="Ejercita la memoria con el juego de parejas. A tu ritmo."
              foot="Abrir"
              to="/juegos"
            />
          </div>
        ) : (
          // módulos del CUIDADOR / FAMILIAR (gestión)
          <div className="modules">
            <Module
              tone="primary"
              icon="pill"
              name="Medicamentos"
              desc={
                usuario.rol === 'CUIDADOR'
                  ? 'Remedios, dosis y horarios. Gestiona las tomas.'
                  : 'Remedios, dosis y horarios. Consulta las tomas.'
              }
              foot="Abrir"
              to="/medicamentos"
            />
            <Module
              tone="accent"
              icon="calendar"
              name="Agenda del día"
              desc={
                usuario.rol === 'CUIDADOR'
                  ? 'Organiza la rutina diaria del adulto mayor.'
                  : 'Revisa la rutina diaria del adulto mayor.'
              }
              foot="Abrir"
              to="/agenda"
            />
            {/* juegos: solo el CUIDADOR (el FAMILIAR no entra) */}
            {usuario.rol === 'CUIDADOR' && (
              <Module
                tone="warn"
                icon="puzzle"
                name="Juegos y progreso"
                desc="Estimulación cognitiva y seguimiento del avance."
                foot="Abrir"
                to="/juegos"
              />
            )}
            <Module
              tone="primary"
              icon="users"
              name="Familia"
              desc="Contactos y personas de confianza."
              foot="Próximamente"
              disabled
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Inicio;
