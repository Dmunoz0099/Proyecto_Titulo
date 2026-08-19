// PanelAlertas.jsx -> el panel de alertas SOS para el CUIDADOR y el FAMILIAR.
// Muestra bien destacadas las alertas pendientes que generó el paciente con su
// botón "Necesito ayuda" y deja marcarlas como atendidas.
// Es la contraparte del BotonSOS: el paciente pide ayuda, el equipo la ve acá.
// Marca la diferencia de roles (el paciente no ve este panel; el equipo no tiene
// el botón de pedir ayuda).

import { useState } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';
import { listarAlertas, atenderAlerta } from '../../api/alertas.js';
import { useRecurso } from '../../api/cache.js';

// una fecha ISO -> "12 jun, 14:05"
function fechaHora(iso) {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PanelAlertas() {
  const [atendiendo, setAtendiendo] = useState(null); // id que estoy atendiendo

  // alertas desde la caché compartida (misma key que la campana): al volver al
  // inicio se ven al instante y se refrescan por detrás, sin parpadeo.
  const { datos: alertas, cargando, mutar: mutarAlertas } = useRecurso(
    'alertas',
    listarAlertas,
    { inicial: [] }
  );

  async function marcarAtendida(id) {
    setAtendiendo(id);
    try {
      const actualizada = await atenderAlerta(id);
      // cambio la alerta de la lista por la versión ya atendida
      mutarAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, ...actualizada } : a)));
    } catch {
      // si falla, la dejo como pendiente
    } finally {
      setAtendiendo(null);
    }
  }

  // mientras carga no muestro nada (evita parpadeos en el inicio)
  if (cargando) return null;

  const pendientes = alertas.filter((a) => !a.atendida);

  // si no hay ninguna alerta, no ocupo espacio en el inicio
  if (alertas.length === 0) return null;

  // sin pendientes pero con historial: un aviso tranquilo de "todo en orden"
  if (pendientes.length === 0) {
    return (
      <div className="aviso aviso-ok" role="status" style={{ marginBottom: 0 }}>
        <Icon name="check" size={24} />
        Sin alertas pendientes. Todo en orden.
      </div>
    );
  }

  return (
    <section className="alertas card" aria-label="Alertas de ayuda">
      <div className="alertas-head">
        <span className="tile tile-danger">
          <Icon name="lifebuoy" size={28} />
        </span>
        <div>
          <div className="alertas-title">Pedido de ayuda</div>
          <div className="alertas-sub muted">
            {pendientes.length === 1
              ? 'Hay 1 alerta pendiente'
              : `Hay ${pendientes.length} alertas pendientes`}
          </div>
        </div>
      </div>

      <ul className="alertas-list">
        {pendientes.map((a) => (
          <li key={a.id} className="alerta-item">
            <div className="alerta-info">
              <div className="alerta-msg">{a.mensaje || 'Necesito ayuda'}</div>
              <div className="alerta-meta muted">
                {a.creadaPor?.nombre || 'Paciente'} · {fechaHora(a.creadaEn)}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => marcarAtendida(a.id)}
              disabled={atendiendo === a.id}
            >
              {atendiendo === a.id ? 'Guardando…' : 'Marcar atendida'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PanelAlertas;
