// AppBar.jsx -> la barra de arriba común a las pantallas internas.
// Muestra la marca (link al Inicio), un resumen del usuario logueado y el botón
// de cerrar sesión. Opcionalmente un botón "volver". Los datos del usuario salen
// de useAuth (no por props fijas como en los prototipos HTML).

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Logo } from '../ui/Logo.jsx';
import { Icon } from '../ui/Icon.jsx';
import { CampanaRecordatorios } from '../../features/recordatorios/CampanaRecordatorios.jsx';
import { CampanaAlertas } from '../../features/alertas/CampanaAlertas.jsx';

// nombre "bonito" del rol para mostrar junto al nombre (en vez del enum crudo)
const ETIQUETA_ROL = {
  PACIENTE: 'Adulto mayor',
  CUIDADOR: 'Cuidador/a',
  FAMILIAR: 'Familiar',
};

// saca 1-2 iniciales del nombre para el avatar
function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/);
  const letras = (partes[0]?.[0] || '') + (partes[1]?.[0] || '');
  return letras.toUpperCase() || '?';
}

export function AppBar({ volver }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <header className="appbar">
      <div className="appbar-inner">
        <div className="appbar-left">
          {/* botón "volver" opcional (ej: de un módulo al Inicio) */}
          {volver && (
            <Link className="icon-btn" to={volver} aria-label="Volver">
              <Icon name="chevronLeft" size={24} />
            </Link>
          )}

          <Link to="/" className="appbar-brand" aria-label="Ir al inicio">
            <Logo size={38} />
            <span className="name">
              Cuida<span>Mayor</span>
            </span>
          </Link>
        </div>

        <div className="appbar-right">
          {/* el PACIENTE ve la campana con sus recordatorios; el CUIDADOR y el
              FAMILIAR ven la de alertas con los pedidos de ayuda pendientes */}
          {usuario?.rol === 'PACIENTE' && <CampanaRecordatorios />}
          {(usuario?.rol === 'CUIDADOR' || usuario?.rol === 'FAMILIAR') && <CampanaAlertas />}

          {usuario && (
            <div className="user-chip">
              <span className="avatar" aria-hidden="true">
                {iniciales(usuario.nombre)}
              </span>
              <span className="who">
                <span className="u-name">{usuario.nombre}</span>
                <span className="u-role">
                  {ETIQUETA_ROL[usuario.rol] || usuario.rol}
                </span>
              </span>
            </div>
          )}

          <button type="button" className="btn btn-ghost" onClick={manejarCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppBar;
