// Registro.jsx -> pantalla para crear cuenta, con el mismo diseño del login.
// Reusa Login.css (mismas clases) y suma un selector de rol grande y claro.
// Pide nombre, nombre de usuario (con el que se entra), correo OPCIONAL (para
// los adultos mayores que no tienen), contraseña y rol. Al registrarse ya queda
// con la sesión iniciada.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/ui/Logo.jsx';
import './Login.css';

// opciones de rol con textos amables para que cualquiera entienda qué elige.
// El "valor" sí es el del enum del backend.
const ROLES = [
  {
    valor: 'PACIENTE',
    emoji: '🌿',
    titulo: 'Adulto mayor',
    desc: 'La persona que recibe el cuidado',
  },
  {
    valor: 'CUIDADOR',
    emoji: '💚',
    titulo: 'Cuidador o cuidadora',
    desc: 'Acompaña y registra el día a día',
  },
  {
    valor: 'FAMILIAR',
    emoji: '👪',
    titulo: 'Familiar',
    desc: 'Sigue el bienestar de forma remota',
  },
];

// mismo formato de nombre de usuario que valida el backend
const USUARIO_REGEX = /^[a-z0-9._-]+$/;

function Registro() {
  const { registrarse } = useAuth();
  const navigate = useNavigate();

  // campos del form (controlados)
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');

  // estado de la UI
  const [reveal, setReveal] = useState(false); // mostrar/ocultar contraseña
  const [touched, setTouched] = useState({
    nombre: false,
    usuario: false,
    password: false,
    rol: false,
  });
  const [error, setError] = useState(''); // mensaje general del backend
  const [loading, setLoading] = useState(false); // enviando

  // paso el usuario a minúsculas mientras se escribe, así coincide con lo que
  // valido y con cómo va a iniciar sesión después
  const usuarioLimpio = nombreUsuario.trim().toLowerCase();

  // validaciones por campo (solo salen si el campo ya fue tocado)
  const nombreEmpty = touched.nombre && nombre.trim() === '';
  const passShort = touched.password && password.length > 0 && password.length < 6;
  const passEmpty = touched.password && password.length === 0;
  const rolEmpty = touched.rol && rol === '';

  // mensaje de ayuda/validación del nombre de usuario
  let usuarioMsg = '';
  if (touched.usuario) {
    if (usuarioLimpio === '') usuarioMsg = 'Escribe un nombre de usuario.';
    else if (usuarioLimpio.length < 3)
      usuarioMsg = 'Debe tener al menos 3 caracteres.';
    else if (!USUARIO_REGEX.test(usuarioLimpio))
      usuarioMsg = 'Usa solo letras, números, punto, guion o guion bajo (sin espacios).';
  }
  const usuarioInvalido = usuarioMsg !== '';

  // ¿está listo para mandar?
  function formularioValido() {
    return (
      nombre.trim() !== '' &&
      usuarioLimpio.length >= 3 &&
      USUARIO_REGEX.test(usuarioLimpio) &&
      password.length >= 6 &&
      rol !== ''
    );
  }

  async function submit(e) {
    e.preventDefault();
    // marco todo como tocado para que salgan los avisos pendientes
    setTouched({ nombre: true, usuario: true, password: true, rol: true });
    setError('');

    if (!formularioValido()) return;

    setLoading(true);
    try {
      // registro real contra la API. El email vacío va tal cual: el backend
      // lo toma como "sin email".
      await registrarse({
        nombre: nombre.trim(),
        nombreUsuario: usuarioLimpio,
        email: email.trim(),
        password,
        rol,
      });
      navigate('/'); // salió bien -> al inicio (ya logueado)
    } catch (err) {
      // prefiero el mensaje del backend; si trae detalles de validación,
      // muestro el primero para orientar a la persona
      const data = err.response?.data;
      const mensaje =
        data?.detalles?.[0]?.mensaje ||
        data?.error ||
        'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
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
            <h1>Crea tu cuenta y empecemos</h1>
            <p>En pocos pasos tendrás tu espacio para acompañar con calma.</p>
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

          <h1 className="form-title">Crear una cuenta</h1>
          <p className="form-sub">Completa tus datos para empezar a usar tu espacio de cuidado.</p>

          {/* banner de error general */}
          {error && (
            <div className="alert" role="alert">
              <span className="ico">!</span>
              <span className="txt">
                <strong>No pudimos crear tu cuenta</strong>
                <span>{error}</span>
              </span>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            {/* nombre */}
            <div className={`field ${nombreEmpty ? 'invalid' : ''}`}>
              <label htmlFor="nombre">Tu nombre</label>
              <div className="input-wrap">
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  placeholder="Por ejemplo: Rosa Pérez"
                  value={nombre}
                  aria-invalid={nombreEmpty}
                  aria-describedby={nombreEmpty ? 'nombre-hint' : undefined}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((s) => ({ ...s, nombre: true }))}
                />
              </div>
              {nombreEmpty && (
                <div className="field-hint" id="nombre-hint">
                  <span className="mark">!</span> Escribe tu nombre.
                </div>
              )}
            </div>

            {/* nombre de usuario */}
            <div className={`field ${usuarioInvalido ? 'invalid' : ''}`}>
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
                  aria-invalid={usuarioInvalido}
                  aria-describedby="usuario-help"
                  onChange={(e) => {
                    setNombreUsuario(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((s) => ({ ...s, usuario: true }))}
                />
              </div>
              {usuarioInvalido ? (
                <div className="field-hint" id="usuario-help">
                  <span className="mark">!</span> {usuarioMsg}
                </div>
              ) : (
                <div className="field-note" id="usuario-help">
                  Con este nombre iniciarás sesión. Solo letras, números, punto,
                  guion o guion bajo.
                </div>
              )}
            </div>

            {/* correo (opcional) */}
            <div className="field">
              <label htmlFor="email">
                Correo electrónico <span className="opcional">(opcional)</span>
              </label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  aria-describedby="email-note"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                />
              </div>
              <div className="field-note" id="email-note">
                Si no tienes correo, puedes dejarlo en blanco.
              </div>
            </div>

            {/* contraseña, con el botón de mostrar/ocultar */}
            <div className={`field has-toggle ${passEmpty || passShort ? 'invalid' : ''}`}>
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={reveal ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Crea una contraseña"
                  value={password}
                  aria-invalid={passEmpty || passShort}
                  aria-describedby="pass-help"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched((s) => ({ ...s, password: true }))}
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
              {passEmpty ? (
                <div className="field-hint" id="pass-help">
                  <span className="mark">!</span> Escribe una contraseña.
                </div>
              ) : passShort ? (
                <div className="field-hint" id="pass-help">
                  <span className="mark">!</span> Debe tener al menos 6 caracteres.
                </div>
              ) : (
                <div className="field-note" id="pass-help">
                  Usa al menos 6 caracteres. Toca “Mostrar” para revisarla.
                </div>
              )}
            </div>

            {/* selector de rol, grande y claro */}
            <fieldset
              className={`role-group ${rolEmpty ? 'invalid' : ''}`}
              onBlur={() => setTouched((s) => ({ ...s, rol: true }))}
            >
              <legend>¿Quién va a usar esta cuenta?</legend>
              <div className="roles">
                {ROLES.map((opcion) => (
                  <label
                    key={opcion.valor}
                    className={`role-card ${rol === opcion.valor ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={opcion.valor}
                      checked={rol === opcion.valor}
                      onChange={() => {
                        setRol(opcion.valor);
                        setTouched((s) => ({ ...s, rol: true }));
                        setError('');
                      }}
                    />
                    <span className="role-emoji" aria-hidden="true">
                      {opcion.emoji}
                    </span>
                    <span className="role-text">
                      <span className="role-title">{opcion.titulo}</span>
                      <span className="role-desc">{opcion.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              {rolEmpty && (
                <div className="field-hint">
                  <span className="mark">!</span> Elige una opción.
                </div>
              )}
            </fieldset>

            {/* botón principal, con spinner mientras manda */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Creando tu cuenta…
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* link al login para quien ya tiene cuenta */}
          <div className="signup-row">
            ¿Ya tienes una cuenta?
            <Link className="link" to="/login">
              Inicia sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Registro;
