// JuegosPage.jsx -> la página del módulo "Calma y juegos". Junta el juego
// (Memorice) y el Seguimiento (progreso), y se adapta al rol:
//  - PACIENTE / CUIDADOR: juegan y ven el progreso.
//  - FAMILIAR: solo monitorea (ve el progreso, no juega).
// Cuando termina una partida se guarda como SesionJuego y refresco el seguimiento
// para ver el resultado nuevo al toque.

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AppBar } from '../../components/layout/AppBar.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Memorice } from './Memorice.jsx';
import { Seguimiento } from './Seguimiento.jsx';
import { registrarSesion, listarSesiones } from '../../api/juegos.js';
import './juegos.css';

function JuegosPage() {
  const { usuario } = useAuth();
  const puedeJugar = usuario.rol === 'PACIENTE' || usuario.rol === 'CUIDADOR';

  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  async function cargarSesiones() {
    try {
      setSesiones(await listarSesiones());
    } catch {
      // si falla, el seguimiento muestra el estado vacío; no rompo nada
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarSesiones();
  }, []);

  // al ganar una partida: guardo la sesión y refresco el progreso
  async function alTerminar(resultado) {
    setError('');
    try {
      await registrarSesion(resultado);
      setAviso(`¡Partida guardada! Puntaje: ${resultado.puntaje}.`);
      await cargarSesiones();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar la partida.');
    }
  }

  return (
    <div className="page">
      <AppBar volver="/" />

      <main className="container">
        <div className="head-row">
          <div>
            <h1 className="t-h1">Calma y juegos</h1>
            <div className="sub">Ejercita la memoria con tranquilidad.</div>
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

        {/* el juego, solo para quien puede jugar */}
        {puedeJugar && (
          <section className="card juego-card">
            <div className="juego-card-head">
              <span className="tile tile-warn"><Icon name="puzzle" size={28} /></span>
              <div>
                <div className="juego-card-title">Memorice</div>
                <div className="juego-card-sub muted">
                  Descubre las cartas y encuentra las parejas iguales.
                </div>
              </div>
            </div>
            <Memorice onTerminar={alTerminar} />
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
