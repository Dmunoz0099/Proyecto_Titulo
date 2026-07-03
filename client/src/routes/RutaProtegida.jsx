// RutaProtegida.jsx -> envuelve las rutas privadas:
//  - mientras chequeo la sesión, muestro "Cargando…"
//  - si no hay usuario, mando a /login
//  - si la ruta pide ciertos roles y el usuario no los tiene, lo mando al inicio

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth();

  // mientras recupero la sesión no decido nada
  if (cargando) {
    return (
      <main className="contenedor-app">
        <p className="texto-grande">Cargando…</p>
      </main>
    );
  }

  // sin sesión -> login. "replace" para que el botón Atrás no vuelva a la página protegida.
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // la ruta exige roles y el del usuario no está -> inicio
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  // todo ok: muestro el contenido protegido
  return children;
}
