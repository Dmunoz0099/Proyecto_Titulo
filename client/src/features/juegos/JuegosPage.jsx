// JuegosPage.jsx -> la página del módulo "Calma y juegos". Ahora hay DOS juegos
// (Memorice de parejas y Sopa de letras), así que primero se elige cuál jugar y
// después aparece el juego; el Seguimiento (progreso) va siempre abajo.
// Se adapta al rol:
//  - PACIENTE / CUIDADOR: eligen y juegan, y ven el progreso.
//  - FAMILIAR: solo monitorea (ve el progreso, no juega).
// Al terminar una partida se guarda como SesionJuego (con su tipoJuego) y se
// refresca el seguimiento para ver el resultado nuevo al toque.

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AppBar } from '../../components/layout/AppBar.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Memorice } from './Memorice.jsx';
import { SopaLetras } from './SopaLetras.jsx';
import { Seguimiento } from './Seguimiento.jsx';
import { registrarSesion, listarSesiones } from '../../api/juegos.js';
import { useRecurso } from '../../api/cache.js';
import './juegos.css';

// los dos juegos disponibles, con su tipo (lo que se guarda en la BD)
const JUEGOS = [
  {
    id: 'memorice',
    tipoJuego: 'PALABRAS',
    icono: 'puzzle',
    tono: 'tile-warn',
    titulo: 'Memorice',
    descripcion: 'Descubre las cartas y encuentra las parejas iguales.',
  },
  {
    id: 'sopa',
    tipoJuego: 'SOPA_LETRAS',
    icono: 'grid',
    tono: 'tile-accent',
    titulo: 'Sopa de letras',
    descripcion: 'Busca las palabras escondidas en el tablero de letras.',
  },
];

function JuegosPage() {
  const { usuario } = useAuth();
  const puedeJugar = usuario.rol === 'PACIENTE' || usuario.rol === 'CUIDADOR';

  const [juegoElegido, setJuegoElegido] = useState(null); // 'memorice' | 'sopa' | null
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  // las sesiones salen de la caché compartida ('sesiones'): al volver a Calma y
  // juegos el progreso se ve al instante y se refresca por detrás, sin el
  // "Cargando…" cada vez que se entra a la pantalla.
  const {
    datos: sesiones,
    cargando,
    refrescar: refrescarSesiones,
  } = useRecurso('sesiones', listarSesiones, { inicial: [] });

  // al ganar una partida: guardo la sesión (con su tipo) y refresco el progreso
  async function alTerminar(tipoJuego, resultado) {
    setError('');
    try {
      await registrarSesion({ ...resultado, tipoJuego });
      setAviso(`¡Partida guardada! Puntaje: ${resultado.puntaje}.`);
      await refrescarSesiones();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar la partida.');
    }
  }

  const juego = JUEGOS.find((j) => j.id === juegoElegido);

  return (
    <div className="page">
      <AppBar volver="/" />

      <main className="container">
        <div className="head-row">
          <div>
            <h1 className="t-h1">Calma y juegos</h1>
            <div className="sub">Ejercita la mente con tranquilidad.</div>
          </div>
        </div>

        {aviso && (
          <div className="aviso aviso-ok" role="status">
            <Icon name="check" size={24} stroke={2.5} />
            <span>{aviso}</span>
            <button className="aviso-x" onClick={() => setAviso('')} aria-label="Cerrar aviso">
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

        {/* solo quien puede jugar ve la selección y los juegos */}
        {puedeJugar && !juego && (
          <section className="juego-elige">
            <h2 className="section-title">Elige un juego</h2>
            <div className="juego-elige-grid">
              {JUEGOS.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className="card juego-opcion"
                  onClick={() => setJuegoElegido(j.id)}
                >
                  <span className={`tile ${j.tono}`}><Icon name={j.icono} size={30} /></span>
                  <span className="juego-opcion-titulo">{j.titulo}</span>
                  <span className="juego-opcion-sub muted">{j.descripcion}</span>
                  <span className="juego-opcion-cta">Jugar <Icon name="chevronRight" size={20} /></span>
                </button>
              ))}
            </div>
          </section>
        )}

        {puedeJugar && juego && (
          <section className="card juego-card">
            <div className="juego-card-head">
              <span className={`tile ${juego.tono}`}><Icon name={juego.icono} size={28} /></span>
              <div>
                <div className="juego-card-title">{juego.titulo}</div>
                <div className="juego-card-sub muted">{juego.descripcion}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost juego-volver"
                onClick={() => setJuegoElegido(null)}
              >
                <Icon name="chevronLeft" size={20} /> Otro juego
              </button>
            </div>

            {juego.id === 'memorice' && (
              <Memorice onTerminar={(r) => alTerminar('PALABRAS', r)} />
            )}
            {juego.id === 'sopa' && (
              <SopaLetras onTerminar={(r) => alTerminar('SOPA_LETRAS', r)} />
            )}
          </section>
        )}

        {/* el seguimiento, para todos los roles */}
        <h2 className="section-title" style={{ marginTop: 'var(--sp-5)' }}>
          Progreso
        </h2>
        <Seguimiento sesiones={sesiones} cargando={cargando} />
      </main>
    </div>
  );
}

export default JuegosPage;
