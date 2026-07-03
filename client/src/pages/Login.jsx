// Login.jsx -> la pantalla de inicio de sesión con el diseño "CuidaMayor":
// cálida y accesible para adultos mayores. La parte visual viene del diseño
// entregado; acá la enchufo a la autenticación real (useAuth) y a React Router.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/ui/Logo.jsx';
import './Login.css';

function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  // campos del form (controlados)
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');

  // estado de la UI
  const [reveal, setReveal] = useState(false); // mostrar/ocultar contraseña
  const [touched, setTouched] = useState({ usuario: false, password: false }); // campos ya "tocados"
  const [error, setError] = useState(''); // error que devuelve el backend
  const [loading, setLoading] = useState(false); // enviando

  // marco un campo como inválido solo si ya lo tocaron y quedó vacío
  const usuarioEmpty = touched.usuario && nombreUsuario.trim() === '';
  const passEmpty = touched.password && password.trim() === '';

  async function submit(e) {
    e.preventDefault();
    // al enviar marco los dos campos como tocados para que salgan los avisos
    setTouched({ usuario: true, password: true });
    setError('');

    // chequeo mínimo del lado del cliente (el que valida de verdad es el backend)
    if (nombreUsuario.trim() === '' || password.trim() === '') return;

    setLoading(true);
    try {
      // login real contra la API
      await iniciarSesion({ nombreUsuario, password });
      navigate('/'); // salió bien -> al inicio
    } catch (err) {
      // muestro el mensaje del backend (o uno amable por defecto)
      const mensaje =
        err.response?.data?.error ||
        'El usuario o la contraseña no coinciden. Revísalos con calma y vuelve a intentarlo.';
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

          <h1 className="form-title">Iniciar sesión</h1>
          <p className="form-sub">Escribe tus datos para entrar a tu espacio de cuidado.</p>

          {/* banner de error general */}
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
            {/* nombre de usuario */}
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

            {/* contraseña, con el botón de mostrar/ocultar */}
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

            {/* recuperar contraseña (por ahora es un placeholder) */}
            <div className="row-between">
              <button
                type="button"
                className="link"
                onClick={() =>
                  alert('Pronto podrás recuperar tu contraseña desde aquí.')
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* botón principal, con spinner mientras manda */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Entrando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* link al registro para quien todavía no tiene cuenta */}
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
        </div>
      </main>
    </div>
  );
}

export default Login;
