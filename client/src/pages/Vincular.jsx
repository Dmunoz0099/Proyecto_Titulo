// Vincular.jsx -> el paso que conecta la cuenta con un adulto mayor, justo
// después de registrarse. Es lo que hace que un usuario nuevo deje de estar
// "huérfano" y pueda ver/cargar datos.
//
// Se ramifica por rol:
//   - CUIDADOR: crea al adulto mayor que va a cuidar y recibe un código para
//     compartir con la familia y el paciente.
//   - FAMILIAR / PACIENTE: ingresan ese código y quedan asociados al mismo
//     adulto mayor (sin duplicarlo).
//
// También sirve de "re-ver el código": si un cuidador YA vinculado entra acá
// (desde el módulo Familia del inicio), le muestro el código para compartir de
// nuevo. Un familiar/paciente ya vinculado no tiene nada que hacer -> al inicio.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/ui/Logo.jsx';
import {
  obtenerEstado,
  crearPaciente,
  unirConCodigo,
  crearCuentaPaciente,
  cambiarPinPaciente,
} from '../api/vinculacion.js';
import { PinPad } from '../components/ui/PinPad.jsx';

// mismo formato de nombre de usuario que valida el backend
const USUARIO_REGEX = /^[a-z0-9._-]+$/;
import './Login.css';
import './Vincular.css';

function Vincular() {
  const { usuario, aplicarVinculo } = useAuth();
  const navigate = useNavigate();
  const esCuidador = usuario?.rol === 'CUIDADOR';

  // estado de vínculo según el backend (null = todavía cargando)
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    obtenerEstado()
      .then(setEstado)
      .catch(() => setEstado({ vinculado: false }));
  }, []);

  // si ya está vinculado y NO es cuidador, no hay nada que hacer acá
  useEffect(() => {
    if (estado?.vinculado && !esCuidador) navigate('/', { replace: true });
  }, [estado, esCuidador, navigate]);

  // subtítulo del panel según el momento
  let subtitulo;
  if (estado?.vinculado && esCuidador) {
    subtitulo = 'Comparte este código para conectar a la familia y al paciente.';
  } else if (esCuidador) {
    subtitulo = 'Cuéntanos a quién vas a cuidar para preparar su espacio.';
  } else {
    subtitulo = 'Conéctate con tu familiar usando el código que te compartieron.';
  }

  return (
    <div className="app">
      {/* panel de bienvenida (el lado cálido), igual que login/registro */}
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
            <h1>{estado?.vinculado ? 'Tu código' : 'Un último paso'}</h1>
            <p>{subtitulo}</p>
          </div>
        </div>
      </aside>

      {/* columna del formulario: cambia según el rol y si ya está vinculado */}
      <main className="form-col">
        {estado === null ? (
          <div className="card">
            <CabeceraMovil />
            <p className="form-sub">Cargando…</p>
          </div>
        ) : estado.vinculado && esCuidador ? (
          <VerCodigo estado={estado} navigate={navigate} />
        ) : esCuidador ? (
          <FormularioCuidador aplicarVinculo={aplicarVinculo} navigate={navigate} />
        ) : (
          <FormularioCodigo aplicarVinculo={aplicarVinculo} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

// --- cuidador YA vinculado (vista "Familia"): crear la cuenta del paciente y
//     compartir el código con la familia ---
function VerCodigo({ estado, navigate }) {
  // guardo local la info de la cuenta del paciente para poder actualizarla apenas
  // se crea, sin volver a pedir el estado al backend
  const [cuentaPaciente, setCuentaPaciente] = useState(estado.cuentaPaciente);

  return (
    <div className="card">
      <CabeceraMovil />
      <h1 className="form-title">Familia y accesos</h1>
      <p className="form-sub">
        Aquí creas la cuenta de{' '}
        {estado.adultoMayor?.nombre?.split(' ')[0] || 'la persona que cuidas'} y
        compartes el código para que la familia se conecte.
      </p>

      {/* 1) cuenta del adulto mayor (paciente) */}
      <section className="bloque-vinc">
        <h2 className="bloque-titulo">Cuenta del adulto mayor</h2>
        {cuentaPaciente?.existe ? (
          <CuentaCreada nombreUsuario={cuentaPaciente.nombreUsuario} />
        ) : (
          <FormularioCuentaPaciente
            nombreSugerido={estado.adultoMayor?.nombre || ''}
            onCreada={(paciente) =>
              setCuentaPaciente({
                existe: true,
                nombreUsuario: paciente.nombreUsuario,
              })
            }
          />
        )}
      </section>

      {/* 2) código para invitar a la familia */}
      <section className="bloque-vinc">
        <h2 className="bloque-titulo">Invitar a un familiar</h2>
        {estado.codigo ? (
          <>
            <p className="field-note" style={{ marginBottom: 8 }}>
              Comparte este código con la familia para que sigan el bienestar de{' '}
              {estado.adultoMayor?.nombre?.split(' ')[0] || 'la persona'}.
            </p>
            <CodigoDestacado codigo={estado.codigo} />
          </>
        ) : (
          <p className="field-note">
            Esta cuenta no tiene un código de invitación asignado.
          </p>
        )}
      </section>

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 18 }}
        onClick={() => navigate('/', { replace: true })}
      >
        Volver al inicio
      </button>
    </div>
  );
}

// formulario para que el cuidador cree la cuenta del paciente (usuario + clave
// simple, sin correo). Al crearla, avisa al padre para mostrar "ya creada".
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

// --- CUIDADOR sin vincular: crea al adulto mayor y luego ve el código ---
function FormularioCuidador({ aplicarVinculo, navigate }) {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [notas, setNotas] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // cuando ya se creó, guardo el código y el nombre para la pantalla de "listo"
  const [creado, setCreado] = useState(null);

  const nombreEmpty = touched && nombre.trim() === '';

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (nombre.trim() === '') return;

    setLoading(true);
    try {
      const datos = await crearPaciente({
        nombre: nombre.trim(),
        fechaNacimiento,
        notas: notas.trim(),
      });
      // aplico el token nuevo (ya con el vínculo) pero NO navego todavía: primero
      // muestro el código para que lo pueda compartir/anotar.
      aplicarVinculo(datos);
      setCreado({ codigo: datos.codigo, nombre: datos.adultoMayor.nombre });
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detalles?.[0]?.mensaje ||
          data?.error ||
          'No pudimos guardar los datos. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  // pantalla de "listo": muestra el código grande y el botón para entrar
  if (creado) {
    return (
      <div className="card">
        <CabeceraMovil />
        <h1 className="form-title">¡Todo listo!</h1>
        <p className="form-sub">
          Ya preparamos el espacio de <strong>{creado.nombre}</strong>. Comparte
          este código con la familia y con {creado.nombre.split(' ')[0]} para que
          se conecten a la misma cuenta.
        </p>

        <CodigoDestacado codigo={creado.codigo} />

        <p className="field-note" style={{ marginTop: 16 }}>
          Puedes volver a ver este código cuando quieras desde “Familia”, en el
          inicio.
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/', { replace: true })}
        >
          Entrar a mi espacio
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <CabeceraMovil />
      <h1 className="form-title">¿A quién vas a cuidar?</h1>
      <p className="form-sub">
        Con estos datos creamos el espacio del adulto mayor. Luego podrás cargar
        sus remedios, su agenda y más.
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

      <form onSubmit={submit} noValidate>
        <div className={`field ${nombreEmpty ? 'invalid' : ''}`}>
          <label htmlFor="nombre">Nombre del adulto mayor</label>
          <div className="input-wrap">
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              placeholder="Por ejemplo: Rosa Pérez"
              value={nombre}
              aria-invalid={nombreEmpty}
              onChange={(e) => {
                setNombre(e.target.value);
                setError('');
              }}
              onBlur={() => setTouched(true)}
            />
          </div>
          {nombreEmpty && (
            <div className="field-hint">
              <span className="mark">!</span> Escribe el nombre.
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="fnac">
            Fecha de nacimiento <span className="opcional">(opcional)</span>
          </label>
          <div className="input-wrap">
            <input
              id="fnac"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="notas">
            Notas <span className="opcional">(opcional)</span>
          </label>
          <div className="input-wrap">
            <textarea
              id="notas"
              rows={3}
              placeholder="Algo importante para tener en cuenta (alergias, lentes, etc.)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Creando el espacio…
            </>
          ) : (
            'Crear y continuar'
          )}
        </button>
      </form>
    </div>
  );
}

// --- FAMILIAR / PACIENTE: ingresan el código que les dio el cuidador ---
function FormularioCodigo({ aplicarVinculo, navigate }) {
  const [codigo, setCodigo] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const codigoEmpty = touched && codigo.trim() === '';

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (codigo.trim() === '') return;

    setLoading(true);
    try {
      const datos = await unirConCodigo(codigo.trim());
      aplicarVinculo(datos);
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detalles?.[0]?.mensaje ||
          data?.error ||
          'No pudimos usar ese código. Revísalo e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <CabeceraMovil />
      <h1 className="form-title">Conéctate con tu familiar</h1>
      <p className="form-sub">
        Escribe el código de invitación que te compartió la persona cuidadora.
        Se ve así: <strong>CM-7K3QP</strong>.
      </p>

      {error && (
        <div className="alert" role="alert">
          <span className="ico">!</span>
          <span className="txt">
            <strong>No pudimos conectarte</strong>
            <span>{error}</span>
          </span>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className={`field ${codigoEmpty ? 'invalid' : ''}`}>
          <label htmlFor="codigo">Código de invitación</label>
          <div className="input-wrap">
            <input
              id="codigo"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="CM-7K3QP"
              value={codigo}
              aria-invalid={codigoEmpty}
              className="input-codigo"
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                setError('');
              }}
              onBlur={() => setTouched(true)}
            />
          </div>
          {codigoEmpty && (
            <div className="field-hint">
              <span className="mark">!</span> Escribe el código.
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Conectando…
            </>
          ) : (
            'Conectarme'
          )}
        </button>
      </form>
    </div>
  );
}

// bloque del código grande, con botón para copiarlo
function CodigoDestacado({ codigo }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // si el navegador no deja copiar, no pasa nada: el código se ve igual
    }
  }

  return (
    <div className="codigo-box">
      <span className="codigo-label">Código de invitación</span>
      <span className="codigo-valor">{codigo}</span>
      <button type="button" className="btn-copiar" onClick={copiar}>
        {copiado ? '¡Copiado!' : 'Copiar código'}
      </button>
    </div>
  );
}

// logo que se ve solo en móvil (cuando se esconde el panel lateral)
function CabeceraMovil() {
  return (
    <div className="card-head-logo">
      <Logo size={48} />
      <div>
        <div
          className="brand-name"
          style={{ fontSize: 'calc(1.4rem * var(--scale))' }}
        >
          Cuida<span>Mayor</span>
        </div>
        <div className="brand-tag" style={{ color: 'var(--ink-soft)' }}>
          Cuidado cercano, día a día
        </div>
      </div>
    </div>
  );
}

export default Vincular;
