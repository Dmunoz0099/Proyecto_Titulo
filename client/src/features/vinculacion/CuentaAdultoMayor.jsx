// CuentaAdultoMayor.jsx -> la gestión de la cuenta con la que el adulto mayor
// inicia sesión (usuario + PIN de 4 números, sin correo). Antes vivía dentro de
// Vincular.jsx (la usaba el cuidador); ahora la usa el FAMILIAR desde el módulo
// "Familia", porque es el rol estable de la red: la persona cuidadora puede
// cambiar o faltar, pero la familia sigue. Se reutiliza tal cual (crear si no
// existe, o mostrar el usuario y dejar cambiar el PIN si ya existe).

import { useState } from 'react';
import { PinPad } from '../../components/ui/PinPad.jsx';
import { crearCuentaPaciente, cambiarPinPaciente } from '../../api/vinculacion.js';
import '../../pages/Login.css';

// mismo formato de nombre de usuario que valida el backend
const USUARIO_REGEX = /^[a-z0-9._-]+$/;

// punto de entrada: decide entre "crear" y "ya creada" según el estado.
//   cuentaPaciente -> { existe, nombreUsuario } (de /vinculacion/red o /estado)
//   nombreSugerido -> nombre del adulto mayor, para proponer usuario
//   onCreada       -> aviso al padre cuando recién se crea (para refrescar)
export function CuentaAdultoMayor({ cuentaPaciente, nombreSugerido = '', onCreada }) {
  return cuentaPaciente?.existe ? (
    <CuentaCreada nombreUsuario={cuentaPaciente.nombreUsuario} />
  ) : (
    <FormularioCuentaPaciente nombreSugerido={nombreSugerido} onCreada={onCreada} />
  );
}

// formulario para crear la cuenta del paciente (usuario + PIN). Al crearla, avisa
// al padre para mostrar "ya creada".
function FormularioCuentaPaciente({ nombreSugerido, onCreada }) {
  const [nombre, setNombre] = useState(nombreSugerido);
  // sugiero un usuario a partir del primer nombre (en minúsculas, sin acentos)
  const [nombreUsuario, setNombreUsuario] = useState(
    nombreSugerido
      .split(' ')[0]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // saca los acentos (marcas combinantes)
      .replace(/[^a-z0-9._-]/g, '')
  );
  // "password" es el PIN de 4 dígitos (así lo espera el backend)
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ nombre: false, usuario: false, pin: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const usuarioLimpio = nombreUsuario.trim().toLowerCase();
  const nombreEmpty = touched.nombre && nombre.trim() === '';
  const pinIncompleto = touched.pin && !/^\d{4}$/.test(password);

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
      /^\d{4}$/.test(password)
    );
  }

  async function submit(e) {
    e.preventDefault();
    setTouched({ nombre: true, usuario: true, pin: true });
    setError('');
    if (!valido()) return;

    setLoading(true);
    try {
      const { usuario } = await crearCuentaPaciente({
        nombre: nombre.trim(),
        nombreUsuario: usuarioLimpio,
        password,
      });
      onCreada?.(usuario);
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
      <p className="field-note" style={{ marginBottom: 12 }}>
        Elige un usuario y un PIN de 4 números, y entrégaselos al adulto mayor. No
        hace falta correo.
      </p>

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
        <label htmlFor="pac-nombre">Nombre del adulto mayor</label>
        <div className="input-wrap">
          <input
            id="pac-nombre"
            type="text"
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
        <label htmlFor="pac-usuario">Nombre de usuario</label>
        <div className="input-wrap">
          <input
            id="pac-usuario"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Por ejemplo: rosa"
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
          <div className="field-note">Con este nombre iniciará sesión el paciente.</div>
        )}
      </div>

      <div className={`field ${pinIncompleto ? 'invalid' : ''}`}>
        <label>PIN de 4 números</label>
        <PinPad
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError('');
            if (v.length === 4) setTouched((s) => ({ ...s, pin: true }));
          }}
        />
        {pinIncompleto ? (
          <div className="field-hint" style={{ textAlign: 'center' }}>
            <span className="mark">!</span> El PIN debe ser de 4 números.
          </div>
        ) : (
          <div className="field-note" style={{ textAlign: 'center' }}>
            Algo fácil de recordar y dictar (por ejemplo 1234).
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Creando la cuenta…
          </>
        ) : (
          'Crear cuenta del adulto mayor'
        )}
      </button>
    </form>
  );
}

// cuenta del paciente ya creada: muestra el usuario y deja cambiar el PIN por si
// el adulto mayor lo olvidó.
function CuentaCreada({ nombreUsuario }) {
  const [editando, setEditando] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  async function guardar(nuevoPin) {
    setError('');
    setLoading(true);
    try {
      await cambiarPinPaciente(nuevoPin);
      setListo(true);
      setEditando(false);
      setPin('');
      setTimeout(() => setListo(false), 2500);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detalles?.[0]?.mensaje || data?.error || 'No pudimos cambiar el PIN.');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="field-note">
        Ya está creada. El adulto mayor inicia sesión tocando su tarjeta y su PIN.
        Usuario: <strong>{nombreUsuario}</strong>.
      </p>

      {listo && (
        <p className="field-note" style={{ color: 'var(--primary)' }}>
          ✓ PIN actualizado.
        </p>
      )}

      {editando ? (
        <div className="field" style={{ marginTop: 8 }}>
          <label style={{ textAlign: 'center', display: 'block' }}>Nuevo PIN de 4 números</label>
          {error && (
            <div className="alert" role="alert">
              <span className="ico">!</span>
              <span className="txt">
                <strong>Algo salió mal</strong>
                <span>{error}</span>
              </span>
            </div>
          )}
          <PinPad
            value={pin}
            onChange={(v) => {
              setPin(v);
              setError('');
              if (v.length === 4) guardar(v);
            }}
            disabled={loading}
          />
          <button
            type="button"
            className="btn-secundario"
            onClick={() => {
              setEditando(false);
              setPin('');
              setError('');
            }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-secundario"
          onClick={() => setEditando(true)}
        >
          Cambiar PIN
        </button>
      )}
    </>
  );
}

export default CuentaAdultoMayor;
