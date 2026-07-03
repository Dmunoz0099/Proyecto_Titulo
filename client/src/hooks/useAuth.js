// useAuth.js -> hook para consumir el AuthContext sin repetir código.
// En vez de importar useContext y AuthContext en cada componente:
//   const { usuario, iniciarSesion } = useAuth();

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export function useAuth() {
  const contexto = useContext(AuthContext);

  // por si alguien lo usa fuera del <AuthProvider>: aviso con un error claro
  // en vez de fallar de forma rara
  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return contexto;
}
