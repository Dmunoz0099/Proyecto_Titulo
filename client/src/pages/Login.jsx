// Login.jsx -> la pantalla de inicio de sesión con el diseño "CuidaMayor":
// cálida y accesible para adultos mayores. La parte visual viene del diseño
// entregado; acá la enchufo a la autenticación real (useAuth) y a React Router.
//
// Para que el adulto mayor no tenga que teclear su usuario, la pantalla tiene
// tres modos:
//   - "tarjetas": muestra a quienes ya entraron en ESTE dispositivo como tarjetas
//     grandes; se toca la propia y solo se escribe la clave.
//   - "clave": ya se eligió un usuario (por tarjeta), solo falta la clave.
//   - "manual": escribir usuario y clave a mano (primer uso o "entrar con otro").

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/ui/Logo.jsx';
import {
  leerUsuariosRecordados,
  recordarUsuario,
  olvidarUsuario,
} from '../utils/usuariosRecordados.js';
import { PinPad } from '../components/ui/PinPad.jsx';
import './Login.css';

// nombre "bonito" del rol para mostrar en la tarjeta
const ETIQUETA_ROL = {
  PACIENTE: 'Adulto mayor',
  CUIDADOR: 'Cuidador/a',
  FAMILIAR: 'Familiar',
};

// 1-2 iniciales del nombre para el avatar
function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/);
  const letras = (partes[0]?.[0] || '') + (partes[1]?.[0] || '');
  return letras.toUpperCase() || '?';
}

function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  // campos del form (controlados)
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');

  // usuarios recordados en este dispositivo + el que se eligió por tarjeta
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  // "manual": forzar el formulario de escribir usuario (primer uso o "otro usuario")
  const [manual, setManual] = useState(false);

  // estado de la UI
  const [reveal, setReveal] = useState(false); // mostrar/ocultar contraseña
  // "mantener sesión iniciada": arranca activado porque el caso típico es el
  // dispositivo de casa del adulto mayor (así el cuidador lo deja listo una vez)
  const [recordar, setRecordar] = useState(true);
  const [touched, setTouched] = useState({ usuario: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // al montar leo quiénes ya entraron en este dispositivo
  useEffect(() => {
    setUsuarios(leerUsuariosRecordados());
  }, []);

  // qué modo mostrar
  const modo = seleccionado
    ? 'clave'
    : usuarios.length > 0 && !manual
    ? 'tarjetas'
    : 'manual';

  // marco un campo como inválido solo si ya lo tocaron y quedó vacío
  const usuarioEmpty = touched.usuario && nombreUsuario.trim() === '';
  const passEmpty = touched.password && password.trim() === '';

  // el usuario con el que se va a entrar: el de la tarjeta o el tecleado
  const usuarioParaEntrar = seleccionado ? seleccionado.nombreUsuario : nombreUsuario;
  // ¿el usuario elegido es un paciente? entonces entra con PIN (teclado numérico)
  const conPin = seleccionado?.rol === 'PACIENTE';

  // núcleo del login, reutilizable: lo llama el form (contraseña) y el PIN.
  // Recibe la clave/PIN como argumento porque el PIN se envía solo al completarse
  // y el estado todavía no se actualizó en ese instante.
  async function entrar(clave) {
    setError('');
    if (usuarioParaEntrar.trim() === '' || clave.trim() === '') return;

    setLoading(true);
    try {
      const usuario = await iniciarSesion({
        nombreUsuario: usuarioParaEntrar,
        password: clave,
        recordar,
      });
      // recuerdo a este usuario en el dispositivo para la próxima vez
      recordarUsuario({
        nombreUsuario: usuario.nombreUsuario,
        nombre: usuario.nombre,
        rol: usuario.rol,
      });
      navigate('/');
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        (conPin
          ? 'Ese PIN no es correcto. Vuelve a intentarlo con calma.'
          : 'El usuario o la contraseña no coinciden. Revísalos con calma y vuelve a intentarlo.');
      setError(mensaje);
      if (conPin) setPassword(''); // limpio el PIN para reintentar
    } finally {
      setLoading(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    setTouched({ usuario: true, password: true });
    entrar(password);
  }

  // elegir una tarjeta: paso al modo "clave" con ese usuario
  function elegirUsuario(u) {
    setSeleccionado(u);
    setNombreUsuario(u.nombreUsuario);
    setPassword('');
    setError('');
    setTouched({ usuario: false, password: false });
  }

  // quitar una tarjeta ("¿No eres tú?")
  function quitarTarjeta(nombreUsuarioQuitar) {
    const nueva = olvidarUsuario(nombreUsuarioQuitar);
    setUsuarios(nueva);
    if (nueva.length === 0) setManual(true);
  }

  // volver de "clave" a la lista de tarjetas
  function volverATarjetas() {
    setSeleccionado(null);
    setPassword('');
    setError('');
    setManual(false);
  }

  // ir al formulario manual ("entrar con otro usuario")
  function entrarConOtro() {
    setSeleccionado(null);
    setManual(true);
    setNombreUsuario('');
    setPassword('');
    setError('');
    setTouched({ usuario: false, password: false });
  }

  // bloque compartido: contraseña + "mantener sesión" + botón entrar
  function CamposClave() {
    return (
      <>
        <div className={`field has-toggle ${passEmpty ? 'invalid' : ''}`}>
          <label htmlFor="password">Contraseña</label>
          <div className="input-wrap">
            <input
              id="password"
              type={reveal ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              aria-invalid={passEmpty}
              aria-describedby={passEmpty ? 'pass-hint' : undefined}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onBlur={() => setTouched((s) => ({ ...s, password: true }))}
              autoFocus={modo === 'clave'}
            />
            <button
              type="button"
              className="reveal-btn"
              aria-pressed={reveal}
              onClick={() => setReveal((r) => !r)}
            >
              {reveal ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {passEmpty && (
            <div className="field-hint" id="pass-hint">
              <span className="mark">!</span> Escribe tu contraseña.
            </div>
          )}
        </div>

        <div className="row-between">
          <label className="recordar">
            <input
              type="checkbox"
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
            />
            <span>Mantener sesión iniciada</span>
          </label>
          <button
            type="button"
            className="link"
            onClick={() => alert('Pronto podrás recuperar tu contraseña desde aquí.')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Entrando…
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </>
    );
  }

  return (
    <div className="app">
      {/* panel de bienvenida (el lado cálido) */}
      <aside className="brand-panel">
        <span className="blob b1"></span>
        <span className="blob b2"></span>
        <span className="blob b3"></span>

        <div className="brand-lockup">
          <Logo size={58} />
          <div>
            <div className="brand-name">
              Cuida<span>Mayor</span>
            </div>
            <div className="brand-tag">Cuidado cercano, día a día</div>
          </div>
        </div>

        <div className="panel-mid">
          <div className="welcome">
            <h1>Cuidemos juntos, con calma</h1>
            <p>Tu espacio para acompañar a quienes más quieres, cada día.</p>
          </div>

          <div className="features">
            <div className="feat">
              <span className="badge"><span className="shape square"></span></span>
              <span className="ft">Medicamentos al día</span>
            </div>
            <div className="feat">
              <span className="badge"><span className="shape circle"></span></span>
              <span className="ft">Agenda simple</span>
            </div>
            <div className="feat">
              <span className="badge"><span className="shape diamond"></span></span>
              <span className="ft">Tranquilidad y juegos cognitivos</span>
            </div>
          </div>
        </div>
      </aside>

      {/* la columna del formulario */}
      <main className="form-col">
        <div className="card">
          {/* logo que se ve solo en móvil, cuando se esconde el panel */}
          <div className="card-head-logo">
            <Logo size={48} />
            <div>
              <div className="brand-name" style={{ fontSize: 'calc(1.4rem * var(--scale))' }}>
                Cuida<span>Mayor</span>
              </div>
              <div className="brand-tag" style={{ color: 'var(--ink-soft)' }}>
                Cuidado cercano, día a día
              </div>
            </div>
          </div>

          {/* MODO TARJETAS: elegir quién eres */}
          {modo === 'tarjetas' && (
            <>
              <h1 className="form-title">¿Quién eres?</h1>
              <p className="form-sub">Toca tu nombre para entrar.</p>

              <div className="user-cards">
                {usuarios.map((u) => (
                  <div key={u.nombreUsuario} className="user-card-wrap">
                    <button
                      type="button"
                      className="user-card"
                      onClick={() => elegirUsuario(u)}
                    >
                      <span className="avatar-grande" aria-hidden="true">
                        {iniciales(u.nombre)}
                      </span>
                      <span className="user-card-txt">
                        <span className="uc-name">{u.nombre?.split(' ')[0] || u.nombreUsuario}</span>
                        <span className="uc-role">{ETIQUETA_ROL[u.rol] || ''}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="olvidar-btn"
                      aria-label={`Quitar a ${u.nombre || u.nombreUsuario} de este dispositivo`}
                      onClick={() => quitarTarjeta(u.nombreUsuario)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn-secundario" onClick={entrarConOtro}>
                Entrar con otro usuario
              </button>

              <div className="signup-row">
                ¿Aún no tienes una cuenta?
                <Link className="link" to="/registro">
                  Crear una cuenta
                </Link>
              </div>
            </>
          )}

          {/* MODO CLAVE: ya se eligió un usuario, solo la contraseña */}
          {modo === 'clave' && (
            <>
              <div className="saludo-usuario">
                <span className="avatar-grande" aria-hidden="true">
                  {iniciales(seleccionado.nombre)}
                </span>
                <div>
                  <h1 className="form-title" style={{ marginBottom: 2 }}>
                    Hola, {seleccionado.nombre?.split(' ')[0] || seleccionado.nombreUsuario}
                  </h1>
                  <p className="form-sub" style={{ margin: 0 }}>
                    {conPin
                      ? 'Escribe tu PIN de 4 números para entrar.'
                      : 'Escribe tu contraseña para entrar.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert" role="alert">
                  <span className="ico">!</span>
                  <span className="txt">
                    <strong>No pudimos iniciar tu sesión</strong>
                    <span>{error}</span>
                  </span>
                </div>
              )}

              {conPin ? (
                // paciente: teclado numérico grande, entra solo al completar el PIN
                <>
                  <PinPad
                    value={password}
                    onChange={setPassword}
                    onComplete={(pin) => entrar(pin)}
                    disabled={loading}
                  />
                  {loading && (
                    <p className="form-sub" style={{ textAlign: 'center', marginTop: 14 }}>
                      <span className="spinner"></span> Entrando…
                    </p>
                  )}
                </>
              ) : (
                <form onSubmit={submit} noValidate>
                  {CamposClave()}
                </form>
              )}

              <button type="button" className="btn-secundario" onClick={volverATarjetas}>
                ← Cambiar de usuario
              </button>
            </>
          )}

          {/* MODO MANUAL: escribir usuario y contraseña */}
          {modo === 'manual' && (
            <>
              <h1 className="form-title">Iniciar sesión</h1>
              <p className="form-sub">Escribe tus datos para entrar a tu espacio de cuidado.</p>

              {error && (
                <div className="alert" role="alert">
                  <span className="ico">!</span>
                  <span className="txt">
                    <strong>No pudimos iniciar tu sesión</strong>
                    <span>{error}</span>
                  </span>
                </div>
              )}

              <form onSubmit={submit} noValidate>
                <div className={`field ${usuarioEmpty ? 'invalid' : ''}`}>
                  <label htmlFor="usuario">Nombre de usuario</label>
                  <div className="input-wrap">
                    <input
                      id="usuario"
                      type="text"
                      inputMode="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Por ejemplo: rosa"
                      value={nombreUsuario}
                      aria-invalid={usuarioEmpty}
                      aria-describedby={usuarioEmpty ? 'usuario-hint' : undefined}
                      onChange={(e) => {
                        setNombreUsuario(e.target.value);
                        setError('');
                      }}
                      onBlur={() => setTouched((s) => ({ ...s, usuario: true }))}
                    />
                  </div>
                  {usuarioEmpty && (
                    <div className="field-hint" id="usuario-hint">
                      <span className="mark">!</span> Escribe tu nombre de usuario.
                    </div>
                  )}
                </div>

                {CamposClave()}
              </form>

              {usuarios.length > 0 && (
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => {
                    setManual(false);
                    setNombreUsuario('');
                    setError('');
                  }}
                >
                  ← Volver a mis usuarios
                </button>
              )}

              <div className="signup-row">
                ¿Aún no tienes una cuenta?
                <Link className="link" to="/registro">
                  Crear una cuenta
                </Link>
              </div>

              <div className="help-row">
                ¿Necesitas ayuda?&nbsp;
                <button
                  type="button"
                  className="link"
                  style={{ fontSize: 'inherit' }}
                  onClick={() => alert('Estamos para acompañarte. Llama al 900 123 456.')}
                >
                  Contáctanos
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Login;
