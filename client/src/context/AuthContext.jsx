// AuthContext.jsx -> el contexto global de autenticación.
// Guarda el usuario y el token y los deja a mano desde cualquier componente sin
// andar pasándolos por props. También recupera la sesión al cargar la app si había
// un token en localStorage.

import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';

// el contexto; el valor real lo pone <AuthProvider>
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // datos del usuario logueado (null si no hay sesión)
  const [usuario, setUsuario] = useState(null);

  // arranco el token leyendo localStorage, así sobrevive a los reload
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // true mientras chequeo si hay sesión válida al arrancar.
  // Evita el parpadeo de mostrar /login antes de saberlo.
  const [cargando, setCargando] = useState(true);

  // al montar: si hay token pido el perfil para recuperar la sesión.
  // Si el token está vencido o es inválido, lo limpio.
  useEffect(() => {
    async function recuperarSesion() {
      if (token) {
        try {
          const perfil = await authApi.obtenerPerfil();
          setUsuario(perfil);
        } catch {
          // token inválido/vencido: cierro sesión sin hacer ruido
          localStorage.removeItem('token');
          setToken(null);
          setUsuario(null);
        }
      }
      setCargando(false);
    }
    recuperarSesion();
    // solo una vez, al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login: pega a la API y guarda token + usuario
  async function iniciarSesion(credenciales) {
    const datos = await authApi.login(credenciales);
    localStorage.setItem('token', datos.token);
    setToken(datos.token);
    setUsuario(datos.usuario);
    return datos.usuario;
  }

  // registro: crea el usuario y lo deja ya logueado
  // (el backend devuelve token + usuario, igual que el login)
  async function registrarse(datos) {
    const respuesta = await authApi.registro(datos);
    localStorage.setItem('token', respuesta.token);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }

  // cerrar sesión: limpio todo
  function cerrarSesion() {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  }

  // lo que expongo a toda la app
  const valor = { usuario, token, cargando, iniciarSesion, registrarse, cerrarSesion };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
