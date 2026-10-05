// CuentaCuidador.jsx -> el familiar le crea la cuenta a la persona cuidadora
// desde "Familia" (nombre, usuario y contraseña). Es la otra opción a pasarle el
// código: así la cuidadora entra directo con lo que le entregan, sin registrarse
// ni pasar por /vincular. Se puede usar varias veces (turnos, reemplazos).

import { useState } from 'react';
import { crearCuentaCuidador } from '../../api/vinculacion.js';
import '../../pages/Login.css';

// mismo formato de nombre de usuario que valida el backend
const USUARIO_REGEX = /^[a-z0-9._-]+$/;

//   onCreada -> aviso al padre cuando se crea (para refrescar la lista de la red)
export function CuentaCuidador({ onCreada }) {
  const [abierto, setAbierto] = useState(false);
  // la última cuenta creada, para mostrarle al familiar qué entregar
  const [creada, setCreada] = useState(null);

  if (!abierto) {
    return (
      <>
        {creada && (
          <p className="field-note" style={{ color: 'var(--primary)' }}>
            ✓ Cuenta creada para <strong>{creada.nombre}</strong>. Usuario:{' '}
            <strong>{creada.nombreUsuario}</strong>. Entrégale el usuario y la
            contraseña que elegiste.
          </p>
        )}
        <button
          type="button"
          className="btn-secundario"
          onClick={() => {
            setCreada(null);
            setAbierto(true);
          }}
        >
          Crear cuenta de cuidador/a
        </button>
      </>
    );
  }

  return (
    <FormularioCuidador
      onCancelar={() => setAbierto(false)}
      onCreada={(usuario) => {
        setCreada(usuario);
        setAbierto(false);
        onCreada?.(usuario);
      }}
    />
  );
}

function FormularioCuidador({ onCancelar, onCreada }) {
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ nombre: false, usuario: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const usuarioLimpio = nombreUsuario.trim().toLowerCase();
  const nombreEmpty = touched.nombre && nombre.trim() === '';
  const passwordCorta = touched.password && password.length < 6;

  let usuarioMsg = '';
  if (touched.usuario) {
    if (usuarioLimpio === '') usuarioMsg = 'Escribe un nombre de usuario.';
    else if (usuarioLimpio.length < 3) usuarioMsg = 'Debe tener al menos 3 caracteres.';
    else if (!USUARIO_REGEX.test(usuarioLimpio))
      usuarioMsg = 'Solo letras, números, punto, guion o guion bajo (sin espacios).';
  }
  const usuarioInvalido = usuarioMsg !== '';

  function valido() {
    return (
      nombre.trim() !== '' &&
      usuarioLimpio.length >= 3 &&
      USUARIO_REGEX.test(usuarioLimpio) &&
      password.length >= 6
    );
  }

  async function submit(e) {
    e.preventDefault();
    setTouched({ nombre: true, usuario: true, password: true });
    setError('');
    if (!valido()) return;

    setLoading(true);
    try {
      const { usuario } = await crearCuentaCuidador({
        nombre: nombre.trim(),
        nombreUsuario: usuarioLimpio,
        password,
      });
      onCreada(usuario);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detalles?.[0]?.mensaje ||
          data?.error ||
          'No pudimos crear la cuenta. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className="alert" role="alert">
          <span className="ico">!</span>
          <span className="txt">
            <strong>Algo salió mal</strong>
            <span>{error}</span>
          </span>
        </div>
      )}

      <div className={`field ${nombreEmpty ? 'invalid' : ''}`}>
        <label htmlFor="cui-nombre">Nombre de la persona cuidadora</label>
        <div className="input-wrap">
          <input
            id="cui-nombre"
            type="text"
            placeholder="Por ejemplo: Marta Soto"
            value={nombre}
            aria-invalid={nombreEmpty}
            onChange={(e) => {
              setNombre(e.target.value);
              setError('');
            }}
            onBlur={() => setTouched((s) => ({ ...s, nombre: true }))}
          />
        </div>
        {nombreEmpty && (
          <div className="field-hint">
            <span className="mark">!</span> Escribe el nombre.
          </div>
        )}
      </div>

      <div className={`field ${usuarioInvalido ? 'invalid' : ''}`}>
        <label htmlFor="cui-usuario">Nombre de usuario</label>
        <div className="input-wrap">
          <input
            id="cui-usuario"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Por ejemplo: marta.soto"
            value={nombreUsuario}
            aria-invalid={usuarioInvalido}
            onChange={(e) => {
              setNombreUsuario(e.target.value);
              setError('');
            }}
            onBlur={() => setTouched((s) => ({ ...s, usuario: true }))}
          />
        </div>
        {usuarioInvalido ? (
          <div className="field-hint">
            <span className="mark">!</span> {usuarioMsg}
          </div>
        ) : (
          <div className="field-note">Con este nombre iniciará sesión.</div>
        )}
      </div>

      <div className={`field ${passwordCorta ? 'invalid' : ''}`}>
        <label htmlFor="cui-password">Contraseña</label>
        <div className="input-wrap">
          <input
            id="cui-password"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={password}
            aria-invalid={passwordCorta}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onBlur={() => setTouched((s) => ({ ...s, password: true }))}
          />
        </div>
        {passwordCorta ? (
          <div className="field-hint">
            <span className="mark">!</span> Debe tener al menos 6 caracteres.
          </div>
        ) : (
          <div className="field-note">
            Se ve mientras la escribes para que puedas anotarla y entregarla.
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Creando la cuenta…
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>
      <button type="button" className="btn-secundario" onClick={onCancelar}>
        Cancelar
      </button>
    </form>
  );
}

export default CuentaCuidador;
