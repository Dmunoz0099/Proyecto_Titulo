// BotonSOS.jsx -> el botón grande "Necesito ayuda", exclusivo del PACIENTE.
// Al tocarlo pide una confirmación simple (para evitar avisos por error) y, al
// confirmar, crea una alerta SOS que el cuidador/familiar ven en su inicio.
// Pensado para adultos mayores: área de toque enorme, texto grande, alto
// contraste y un solo paso de confirmación con palabras claras.

import { useState } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';
import { crearAlerta } from '../../api/alertas.js';

export function BotonSOS() {
  // en qué paso del flujo voy: 'idle' (botón), 'confirmar' (modal), 'enviando',
  // 'enviado' (éxito) o 'error'
  const [paso, setPaso] = useState('idle');

  async function enviar() {
    setPaso('enviando');
    try {
      await crearAlerta({ mensaje: 'Necesito ayuda' });
      setPaso('enviado');
    } catch {
      setPaso('error');
    }
  }

  return (
    <section className="sos" aria-label="Pedir ayuda">
      {/* aviso de éxito una vez enviada la alerta */}
      {paso === 'enviado' && (
        <div className="aviso aviso-ok" role="status">
          <Icon name="check" size={26} />
          Listo. Avisamos a tu cuidador y a tu familia. Quédate tranquilo/a.
          <button
            type="button"
            className="aviso-x"
            aria-label="Cerrar aviso"
            onClick={() => setPaso('idle')}
          >
            <Icon name="x" size={20} />
          </button>
        </div>
      )}

      {/* aviso de error si la alerta no salió */}
      {paso === 'error' && (
        <div className="aviso aviso-error" role="alert">
          <Icon name="bell" size={26} />
          No se pudo enviar. Intenta otra vez o llama por teléfono.
          <button
            type="button"
            className="aviso-x"
            aria-label="Cerrar aviso"
            onClick={() => setPaso('idle')}
          >
            <Icon name="x" size={20} />
          </button>
        </div>
      )}

      {/* el botón grande solo aparece mientras no hay un aviso a la vista */}
      {paso !== 'enviado' && (
        <button
          type="button"
          className="sos-btn"
          onClick={() => setPaso('confirmar')}
          disabled={paso === 'enviando'}
        >
          <span className="sos-ico" aria-hidden="true">
            <Icon name="lifebuoy" size={48} />
          </span>
          <span className="sos-txt">
            <span className="sos-title">Necesito ayuda</span>
            <span className="sos-sub">Avisa a tu cuidador y a tu familia</span>
          </span>
        </button>
      )}

      {/* confirmación en un solo paso, con palabras claras */}
      {paso === 'confirmar' && (
        <div className="scrim" role="dialog" aria-modal="true" aria-label="Confirmar pedido de ayuda">
          <div className="modal sos-modal">
            <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="tile tile-danger" style={{ width: 88, height: 88 }}>
                <Icon name="lifebuoy" size={48} />
              </span>
              <h2 className="t-h2">¿Quieres pedir ayuda?</h2>
              <p className="t-lg muted" style={{ maxWidth: '32ch' }}>
                Avisaremos a tu cuidador y a tu familia de que necesitas ayuda.
              </p>
            </div>
            <div className="modal-foot" style={{ flexDirection: 'column' }}>
              <button
                type="button"
                className="btn btn-danger-solid btn-lg btn-block"
                onClick={enviar}
                disabled={paso === 'enviando'}
              >
                {paso === 'enviando' ? 'Enviando…' : 'Sí, pedir ayuda'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg btn-block"
                onClick={() => setPaso('idle')}
                disabled={paso === 'enviando'}
              >
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BotonSOS;
