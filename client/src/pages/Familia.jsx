// Familia.jsx -> el módulo "Familia": la red de apoyo del adulto mayor. Se
// diferencia por rol:
//   - FAMILIAR: es el rol estable de la red (la persona cuidadora puede renunciar
//     o faltar). Por eso GESTIONA: crea la cuenta con la que entra el adulto mayor,
//     cambia su PIN, comparte el código para sumar gente y puede desvincular a
//     alguien de la red.
//   - CUIDADOR: la ve en SOLO LECTURA (por ahora): los datos del adulto mayor, con
//     quién está conectado y el código para copiar.

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { AppBar } from '../components/layout/AppBar.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { DialogoConfirmar } from '../components/ui/DialogoConfirmar.jsx';
import { CuentaAdultoMayor } from '../features/vinculacion/CuentaAdultoMayor.jsx';
import { obtenerRedApoyo, desvincularMiembro } from '../api/vinculacion.js';
import { useRecurso } from '../api/cache.js';
import './Familia.css';

// nombre "bonito" del rol (igual que en la barra de arriba)
const ETIQUETA_ROL = {
  PACIENTE: 'Adulto mayor',
  CUIDADOR: 'Cuidador/a',
  FAMILIAR: 'Familiar',
};

// tono del tile según el rol, para darle algo de color a cada tarjeta
const TONO_ROL = {
  PACIENTE: 'accent',
  CUIDADOR: 'primary',
  FAMILIAR: 'warn',
};

// edad en años a partir de la fecha de nacimiento (o null si no hay dato)
function edadDesde(fechaISO) {
  if (!fechaISO) return null;
  const nac = new Date(fechaISO);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad -= 1;
  return edad >= 0 ? edad : null;
}

// saca 1-2 iniciales del nombre para el avatar de cada persona
function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/);
  const letras = (partes[0]?.[0] || '') + (partes[1]?.[0] || '');
  return letras.toUpperCase() || '?';
}

function Familia() {
  const { usuario } = useAuth();
  const esFamiliar = usuario.rol === 'FAMILIAR';

  const { datos, cargando, error, refrescar } = useRecurso(
    'redApoyo',
    obtenerRedApoyo,
    { inicial: null }
  );

  // persona que se está por quitar (para el diálogo de confirmación), si hay
  const [porQuitar, setPorQuitar] = useState(null);
  const [quitando, setQuitando] = useState(false);
  const [avisoQuitar, setAvisoQuitar] = useState('');

  const adultoMayor = datos?.adultoMayor;
  const miembros = datos?.miembros || [];
  const codigo = datos?.codigo;
  const cuentaPaciente = datos?.cuentaPaciente;
  const edad = edadDesde(adultoMayor?.fechaNacimiento);

  async function quitar(miembro) {
    setQuitando(true);
    setAvisoQuitar('');
    try {
      await desvincularMiembro(miembro.id);
      setPorQuitar(null);
      await refrescar();
    } catch (err) {
      setAvisoQuitar(
        err.response?.data?.error || 'No pudimos desvincular a esta persona.'
      );
    } finally {
      setQuitando(false);
    }
  }

  return (
    <div className="page">
      <AppBar volver="/" />

      <main className="container">
        <div className="fam-head">
          <h1 className="t-h1">Familia</h1>
          <p className="fam-sub muted">
            {esFamiliar
              ? `La red de apoyo de ${adultoMayor?.nombre?.split(' ')[0] || 'la persona que acompañas'}: administra su cuenta, invita gente y revisa quién está conectado.`
              : `La red de apoyo de ${adultoMayor?.nombre?.split(' ')[0] || 'la persona que cuidas'}: quiénes están conectados a su cuidado.`}
          </p>
        </div>

        {cargando && !datos ? (
          <p className="t-lg muted">Cargando…</p>
        ) : error ? (
          <div className="card fam-empty t-lg">
            No pudimos cargar la red de apoyo. Intenta de nuevo más tarde.
          </div>
        ) : (
          <>
            {/* tarjeta del adulto mayor */}
            {adultoMayor && (
              <div className="card fam-am">
                <span className="tile tile-accent fam-am-tile">
                  <Icon name="heart" size={40} />
                </span>
                <div className="fam-am-info">
                  <div className="fam-am-nombre">{adultoMayor.nombre}</div>
                  <div className="fam-am-meta">
                    {edad != null ? `${edad} años` : 'Adulto mayor'}
                  </div>
                  {adultoMayor.notas && (
                    <p className="fam-am-notas">{adultoMayor.notas}</p>
                  )}
                </div>
              </div>
            )}

            {/* personas conectadas */}
            <h2 className="fam-titulo">Personas conectadas</h2>

            {avisoQuitar && (
              <div className="fam-aviso" role="alert">
                <Icon name="bell" size={22} />
                <span>{avisoQuitar}</span>
                <button
                  type="button"
                  className="fam-aviso-x"
                  onClick={() => setAvisoQuitar('')}
                  aria-label="Cerrar aviso"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            )}

            <div className="fam-lista">
              {miembros.map((m) => {
                // el familiar puede quitar a otras personas conectadas, menos a sí
                // mismo y al adulto mayor (su cuenta ES la del paciente). El
                // cuidador ve la red en solo lectura, sin este botón.
                const sePuedeQuitar = esFamiliar && !m.esYo && m.rol !== 'PACIENTE';
                return (
                  <div key={m.id} className="card fam-miembro">
                    <span className={`fam-avatar tile-${TONO_ROL[m.rol] || 'primary'}`}>
                      {iniciales(m.nombre)}
                    </span>
                    <div className="fam-miembro-info">
                      <div className="fam-miembro-nombre">
                        {m.nombre}
                        {m.esYo && <span className="fam-yo">Tú</span>}
                      </div>
                      <div className="fam-miembro-rol">
                        {ETIQUETA_ROL[m.rol] || m.rol}
                      </div>
                    </div>
                    {sePuedeQuitar && (
                      <button
                        type="button"
                        className="fam-quitar"
                        onClick={() => setPorQuitar(m)}
                        aria-label={`Desvincular a ${m.nombre}`}
                      >
                        <Icon name="x" size={20} /> Quitar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* cuenta del adulto mayor: la gestiona el FAMILIAR (crear / cambiar
                PIN). El cuidador no la ve. */}
            {esFamiliar && (
              <>
                <h2 className="fam-titulo fam-titulo-sep">Cuenta del adulto mayor</h2>
                <div className="card fam-codigo-card">
                  <p className="fam-codigo-texto">
                    Con esta cuenta{' '}
                    {adultoMayor?.nombre?.split(' ')[0] || 'el adulto mayor'} inicia
                    sesión (un usuario y un PIN de 4 números, sin correo).
                  </p>
                  <CuentaAdultoMayor
                    cuentaPaciente={cuentaPaciente}
                    nombreSugerido={adultoMayor?.nombre || ''}
                    onCreada={() => refrescar()}
                  />
                </div>
              </>
            )}

            {/* código de invitación: para sumar a una nueva persona cuidadora
                (si la anterior renuncia) o a otro familiar */}
            <h2 className="fam-titulo fam-titulo-sep">Sumar a alguien más</h2>
            <div className="card fam-codigo-card">
              <p className="fam-codigo-texto">
                {esFamiliar
                  ? 'Comparte este código para conectar a una nueva persona cuidadora (si la anterior renuncia) o a otro familiar. Quien lo reciba crea su cuenta y lo ingresa.'
                  : 'Este es el código con el que la familia conecta a más personas al cuidado del adulto mayor.'}
              </p>
              {codigo ? (
                <CodigoInvitacion codigo={codigo} />
              ) : (
                <p className="fam-nota muted" style={{ marginTop: 0 }}>
                  Esta cuenta todavía no tiene un código de invitación.
                </p>
              )}
            </div>

            <p className="fam-nota muted">
              {esFamiliar
                ? 'La rutina del día (medicamentos, agenda) la gestiona la persona cuidadora desde sus módulos.'
                : 'Esta vista es solo de lectura. La cuenta del adulto mayor y los accesos los administra la familia.'}
            </p>
          </>
        )}
      </main>

      {porQuitar && (
        <DialogoConfirmar
          titulo="Desvincular de la red de apoyo"
          mensaje={`${porQuitar.nombre} (${ETIQUETA_ROL[porQuitar.rol] || porQuitar.rol}) dejará de tener acceso a la cuenta del adulto mayor. Podrá volver a unirse con el código si hace falta.`}
          textoConfirmar="Sí, desvincular"
          procesando={quitando}
          onConfirmar={() => quitar(porQuitar)}
          onCancelar={() => setPorQuitar(null)}
        />
      )}
    </div>
  );
}

// recuadro del código de invitación, con botón para copiarlo al portapapeles
function CodigoInvitacion({ codigo }) {
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
    <div className="fam-codigo-box">
      <span className="fam-codigo-label">Código de invitación</span>
      <span className="fam-codigo-valor">{codigo}</span>
      <button type="button" className="fam-codigo-btn" onClick={copiar}>
        {copiado ? '¡Copiado!' : 'Copiar código'}
      </button>
    </div>
  );
}

export default Familia;
