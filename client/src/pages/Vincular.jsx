// Vincular.jsx -> el paso que conecta la cuenta con un adulto mayor, justo
// después de registrarse. Es lo que hace que un usuario nuevo deje de estar
// "huérfano" y pueda ver/cargar datos.
//
// Se ramifica por rol:
//   - FAMILIAR: crea al adulto mayor y recibe un código para sumar a la persona
//     cuidadora (o a otro familiar).
//   - CUIDADOR (u otro rol sin vínculo): ingresa ese código y queda asociado al
//     mismo adulto mayor (sin duplicarlo).
//
// También sirve de "re-ver el código": si un familiar YA vinculado entra acá, le
// muestro el código en solo lectura. Las cuentas del adulto mayor y de la
// cuidadora, y los accesos, se manejan desde el módulo "Familia". Un cuidador ya
// vinculado no tiene nada que hacer acá -> al inicio.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/ui/Logo.jsx';
import {
  obtenerEstado,
  crearPaciente,
  unirConCodigo,
} from '../api/vinculacion.js';
import './Login.css';
import './Vincular.css';

function Vincular() {
  const { usuario, aplicarVinculo } = useAuth();
  const navigate = useNavigate();
  const esFamiliar = usuario?.rol === 'FAMILIAR';

  // estado de vínculo según el backend (null = todavía cargando)
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    obtenerEstado()
      .then(setEstado)
      .catch(() => setEstado({ vinculado: false }));
  }, []);

  // si ya está vinculado y NO es familiar, no hay nada que hacer acá
  useEffect(() => {
    if (estado?.vinculado && !esFamiliar) navigate('/', { replace: true });
  }, [estado, esFamiliar, navigate]);

  // subtítulo del panel según el momento
  let subtitulo;
  if (estado?.vinculado && esFamiliar) {
    subtitulo = 'Comparte este código para sumar a la persona cuidadora.';
  } else if (esFamiliar) {
    subtitulo = 'Cuéntanos a quién van a cuidar para preparar su espacio.';
  } else {
    subtitulo = 'Conéctate usando el código que te compartió la familia.';
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
        ) : estado.vinculado && esFamiliar ? (
          <VerCodigo estado={estado} navigate={navigate} />
        ) : esFamiliar ? (
          <FormularioFamiliar aplicarVinculo={aplicarVinculo} navigate={navigate} />
        ) : (
          <FormularioCodigo aplicarVinculo={aplicarVinculo} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

// --- familiar YA vinculado: el código para compartir. Las cuentas y los
//     accesos se administran desde el módulo "Familia" ---
function VerCodigo({ estado, navigate }) {
  return (
    <div className="card">
      <CabeceraMovil />
      <h1 className="form-title">Tu código</h1>
      <p className="form-sub">
        Este es el código de{' '}
        {estado.adultoMayor?.nombre?.split(' ')[0] || 'tu familiar'}.
        Compártelo con la persona cuidadora para que se conecte. Desde “Familia”
        también puedes crearle la cuenta directamente.
      </p>

      {estado.codigo ? (
        <CodigoDestacado codigo={estado.codigo} />
      ) : (
        <p className="field-note">
          Esta cuenta no tiene un código de invitación asignado.
        </p>
      )}

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

// --- FAMILIAR sin vincular: crea al adulto mayor y luego ve el código ---
function FormularioFamiliar({ aplicarVinculo, navigate }) {
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
          este código con la persona cuidadora para que se conecte a la misma
          cuenta.
        </p>

        <CodigoDestacado codigo={creado.codigo} />

        <p className="field-note" style={{ marginTop: 16 }}>
          En “Familia”, en el inicio, puedes volver a ver este código, crear la
          cuenta de {creado.nombre.split(' ')[0]} y la de la persona cuidadora.
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
      <h1 className="form-title">¿A quién van a cuidar?</h1>
      <p className="form-sub">
        Con estos datos creamos el espacio del adulto mayor. Luego podrás sumar a
        la persona cuidadora y cargar sus remedios, su agenda y más.
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

// --- CUIDADOR (u otro rol sin vínculo): ingresa el código que le dio la familia ---
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
      <h1 className="form-title">Conéctate con la familia</h1>
      <p className="form-sub">
        Escribe el código de invitación que te compartió la familia.
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
