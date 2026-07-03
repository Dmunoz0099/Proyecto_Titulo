// Seguimiento.jsx -> la vista de progreso de los juegos: resumen (partidas, mejor
// y último puntaje), un mini gráfico de barras con las últimas partidas y el
// historial. Lo usan el CUIDADOR/FAMILIAR para monitorear la estimulación
// cognitiva del adulto mayor; el paciente también ve su propio avance.

import { Icon } from '../../components/ui/Icon.jsx';

// 78 segundos -> "1:18"
function mmss(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// fecha corta (ej: "10 jun")
function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function Seguimiento({ sesiones, cargando }) {
  if (cargando) {
    return <p className="t-lg muted">Cargando progreso…</p>;
  }

  if (!sesiones || sesiones.length === 0) {
    return (
      <div className="card empty t-lg">
        Aún no hay partidas registradas. ¡Juega la primera para empezar a ver el progreso!
      </div>
    );
  }

  // sesiones viene de la más nueva a la más vieja
  const total = sesiones.length;
  const mejor = Math.max(...sesiones.map((s) => s.puntaje));
  const ultimo = sesiones[0].puntaje;

  // las últimas 8 partidas en orden cronológico (para el gráfico)
  const ultimas = sesiones.slice(0, 8).reverse();
  const maxBarra = Math.max(...ultimas.map((s) => s.puntaje), 1);

  return (
    <div className="seguimiento">
      {/* tarjetas de resumen */}
      <div className="seg-resumen">
        <div className="card seg-kpi">
          <span className="seg-kpi-num">{total}</span>
          <span className="seg-kpi-lab">Partidas</span>
        </div>
        <div className="card seg-kpi">
          <span className="seg-kpi-num">{mejor}</span>
          <span className="seg-kpi-lab">Mejor puntaje</span>
        </div>
        <div className="card seg-kpi">
          <span className="seg-kpi-num">{ultimo}</span>
          <span className="seg-kpi-lab">Último puntaje</span>
        </div>
      </div>

      {/* mini gráfico de barras de las últimas partidas */}
      <div className="card seg-chart">
        <div className="seg-chart-title">Puntaje de las últimas partidas</div>
        <div className="seg-bars" role="img" aria-label="Gráfico de puntaje por partida">
          {ultimas.map((s) => (
            <div className="seg-bar-wrap" key={s.id}>
              <div className="seg-bar-num">{s.puntaje}</div>
              <div className="seg-bar-track">
                <div
                  className="seg-bar"
                  style={{ height: `${Math.round((s.puntaje / maxBarra) * 100)}%` }}
                />
              </div>
              <div className="seg-bar-fecha">{fechaCorta(s.fecha)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* el historial */}
      <h3 className="t-h3" style={{ marginTop: 'var(--sp-2)' }}>Historial</h3>
      <div className="seg-list">
        {sesiones.slice(0, 12).map((s) => (
          <div className="card seg-row" key={s.id}>
            <span className="tile tile-primary" style={{ width: 46, height: 46 }}>
              <Icon name="puzzle" size={24} />
            </span>
            <div className="seg-row-info">
              <div className="seg-row-top">Memorice · {s.puntaje} pts</div>
              <div className="seg-row-meta muted">
                {fechaCorta(s.fecha)} · {s.aciertos} parejas · {s.errores} errores · {mmss(s.duracionSegundos)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Seguimiento;
