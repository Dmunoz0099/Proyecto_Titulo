// CampanaAlertas.jsx -> el centro de notificaciones de la barra superior para el
// CUIDADOR y el FAMILIAR. Es la contraparte de la campana del paciente: acá el
// equipo ve, sin entrar al inicio, las alertas SOS pendientes que generó el adulto
// mayor (su botón "Necesito ayuda" o los avisos de olvido desde la otra campana) y
// las puede marcar atendidas al toque.
// Reusa los estilos de la campana de recordatorios para tener un solo look de
// "campana + panel" en toda la app.

import { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';
import { listarAlertas, atenderAlerta } from '../../api/alertas.js';
import '../recordatorios/recordatorios.css';

// una fecha ISO -> "12 jun, 14:05"
function fechaHora(iso) {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CampanaAlertas() {
  const [abierto, setAbierto] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [atendiendo, setAtendiendo] = useState(null); // id que estoy atendiendo

  // traigo las alertas. Si falla, la campana queda sin pendientes (nunca rompe la barra).
  useEffect(() => {
    listarAlertas().then(setAlertas).catch(() => {});
  }, []);

  // solo las pendientes cuentan como notificaciones por revisar
  const pendientes = alertas.filter((a) => !a.atendida);
  const total = pendientes.length;

  // marcar una alerta como atendida (resuelve la notificación)
  async function marcarAtendida(id) {
    setAtendiendo(id);
    try {
      const actualizada = await atenderAlerta(id);
      setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, ...actualizada } : a)));
    } catch {
      // si falla, la dejo como pendiente
    } finally {
      setAtendiendo(null);
    }
  }

  return (
    <div className="campana-wrap">
      <button
        type="button"
        className="icon-btn campana-btn"
        aria-label={
          total > 0
            ? `Notificaciones: ${total} pendiente${total === 1 ? '' : 's'}`
            : 'Notificaciones'
        }
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <Icon name="bell" size={26} />
        {total > 0 && <span className="campana-badge">{total}</span>}
      </button>

      {abierto && (
        <>
          {/* capa transparente: un clic afuera cierra el panel */}
          <button
            type="button"
            className="campana-backdrop"
            aria-label="Cerrar notificaciones"
            onClick={() => setAbierto(false)}
          />

          <div className="campana-panel card" role="dialog" aria-label="Notificaciones">
            <div className="campana-head">
              <span className="tile tile-danger"><Icon name="lifebuoy" size={22} /></span>
              <div>
                <div className="campana-title">Notificaciones</div>
                <div className="campana-sub muted">
                  {total === 0
                    ? 'Sin pedidos de ayuda'
                    : `${total} alerta${total === 1 ? '' : 's'} por atender`}
                </div>
              </div>
            </div>

            {total === 0 ? (
              <div className="campana-vacio">
                <Icon name="check" size={28} />
                <span>Todo en orden. No hay pedidos de ayuda.</span>
              </div>
            ) : (
              <ul className="campana-list">
                {pendientes.map((a) => (
                  <li key={a.id} className="rec-item">
                    <span className="tile tile-danger">
                      <Icon name="lifebuoy" size={24} />
                    </span>
                    <div className="rec-info">
                      <div className="rec-title">{a.mensaje || 'Necesito ayuda'}</div>
                      <div className="rec-detalle muted">
                        {a.creadaPor?.nombre || 'Paciente'} · {fechaHora(a.creadaEn)}
                      </div>
                    </div>
                    <div className="rec-acciones">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => marcarAtendida(a.id)}
                        disabled={atendiendo === a.id}
                      >
                        {atendiendo === a.id ? 'Guardando…' : 'Marcar atendida'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CampanaAlertas;
