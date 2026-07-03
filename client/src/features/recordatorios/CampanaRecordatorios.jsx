// CampanaRecordatorios.jsx -> la campana de la barra superior, exclusiva del
// PACIENTE. Según la hora planificada de cada cosa, avisa de:
//  - medicamentos cuya toma ya pasó y no está registrada (olvido real: sabemos
//    que no se tomó porque no hay registro).
//  - actividades de la agenda cuya hora recién pasó (recordatorio suave: la
//    agenda no guarda "hecho/no hecho", así que solo miro la hora y aviso las
//    recientes, no toda la rutina del día).
// Cada recordatorio se puede resolver (marcar la toma) o avisar al cuidador (crea
// una alerta que el cuidador/familiar ven en su inicio).

import { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';
import {
  listarMedicamentos,
  listarTomas,
  registrarToma,
} from '../../api/medicamentos.js';
import { listarEventos } from '../../api/agenda.js';
import { crearAlerta } from '../../api/alertas.js';
import { horaDeISO } from '../agenda/iconosAgenda.js';
import './recordatorios.css';

// cuántos minutos después de su hora sigo mostrando una ACTIVIDAD como
// recordatorio. La agenda no sabe si se hizo, así que limito la ventana para no
// llenar la campana con toda la rutina del día.
const VENTANA_ACTIVIDAD_MIN = 180;

// saca las horas "HH:MM" de un horario en texto libre
function horasDeTexto(texto = '') {
  return (texto.match(/([01]?\d|2[0-3]):[0-5]\d/g) || []).map((h) =>
    h.length === 4 ? `0${h}` : h
  );
}

// "HH:MM" -> minutos desde medianoche (para comparar con la hora actual)
function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// ¿la fecha ISO es de hoy?
function esHoy(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function CampanaRecordatorios() {
  const [abierto, setAbierto] = useState(false);
  const [medicamentos, setMedicamentos] = useState([]);
  const [tomas, setTomas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [marcando, setMarcando] = useState(null); // key de la toma que estoy marcando
  const [avisando, setAvisando] = useState(null); // key del aviso en curso
  const [avisados, setAvisados] = useState(() => new Set()); // los que ya avisé

  // traigo lo necesario para calcular los recordatorios. Si algo falla, la
  // campana simplemente no muestra pendientes (nunca rompe).
  useEffect(() => {
    listarMedicamentos().then(setMedicamentos).catch(() => {});
    listarTomas().then(setTomas).catch(() => {});
    listarEventos().then(setEventos).catch(() => {});
  }, []);

  // hora actual en minutos desde medianoche
  const ahora = new Date();
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();

  // tomas dadas hoy (para saber qué franjas ya están hechas)
  const tomasHoy = tomas.filter((t) => esHoy(t.fechaHora) && t.administrado);

  // --- armo la lista de recordatorios ---
  const recordatorios = [];

  // medicamentos: cada hora planificada que ya pasó y no está registrada
  medicamentos.forEach((m) => {
    horasDeTexto(m.horario).forEach((time) => {
      if (aMinutos(time) >= ahoraMin) return; // todavía no es su hora
      const hecha = tomasHoy.find(
        (t) => t.medicamentoId === m.id && t.comentario === time
      );
      if (!hecha) {
        recordatorios.push({
          key: `med-${m.id}-${time}`,
          tipo: 'med',
          med: m,
          hora: time,
          titulo: m.nombre,
          detalle: `Toma de las ${time}${m.dosis ? ` · ${m.dosis}` : ''}`,
          mensaje: `Olvidé tomar ${m.nombre} de las ${time}`,
        });
      }
    });
  });

  // actividades: las que pasaron su hora hace poco (ventana limitada)
  eventos.forEach((e) => {
    const hhmm = horaDeISO(e.hora);
    const diff = ahoraMin - aMinutos(hhmm);
    if (diff > 0 && diff <= VENTANA_ACTIVIDAD_MIN) {
      recordatorios.push({
        key: `act-${e.id}`,
        tipo: 'act',
        hora: hhmm,
        titulo: e.titulo,
        detalle: `Actividad de las ${hhmm}`,
        mensaje: `Olvidé: ${e.titulo} (${hhmm})`,
      });
    }
  });

  recordatorios.sort((a, b) => a.hora.localeCompare(b.hora));

  // marcar una toma desde la campana (resuelve el recordatorio)
  async function marcarTomada(r) {
    setMarcando(r.key);
    try {
      const toma = await registrarToma(r.med.id, {
        administrado: true,
        comentario: r.hora,
      });
      // meto la toma al estado y el recordatorio desaparece solo
      setTomas((prev) => [{ ...toma }, ...prev]);
    } catch {
      // si falla, dejo el recordatorio como estaba
    } finally {
      setMarcando(null);
    }
  }

  // avisar al cuidador: crea una alerta con el detalle del olvido
  async function avisarCuidador(r) {
    setAvisando(r.key);
    try {
      await crearAlerta({ mensaje: r.mensaje });
      setAvisados((prev) => new Set(prev).add(r.key));
    } catch {
      // si falla, no cambio nada
    } finally {
      setAvisando(null);
    }
  }

  const total = recordatorios.length;

  return (
    <div className="campana-wrap">
      <button
        type="button"
        className="icon-btn campana-btn"
        aria-label={
          total > 0
            ? `Recordatorios: ${total} pendiente${total === 1 ? '' : 's'}`
            : 'Recordatorios'
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
            aria-label="Cerrar recordatorios"
            onClick={() => setAbierto(false)}
          />

          <div className="campana-panel card" role="dialog" aria-label="Recordatorios">
            <div className="campana-head">
              <span className="tile tile-warn"><Icon name="bell" size={22} /></span>
              <div>
                <div className="campana-title">Recordatorios</div>
                <div className="campana-sub muted">
                  {total === 0
                    ? 'Estás al día'
                    : `${total} cosa${total === 1 ? '' : 's'} por revisar`}
                </div>
              </div>
            </div>

            {total === 0 ? (
              <div className="campana-vacio">
                <Icon name="check" size={28} />
                <span>No tienes pendientes. ¡Vas muy bien!</span>
              </div>
            ) : (
              <ul className="campana-list">
                {recordatorios.map((r) => {
                  const yaAvisado = avisados.has(r.key);
                  return (
                    <li key={r.key} className="rec-item">
                      <span className={`tile tile-${r.tipo === 'med' ? 'primary' : 'accent'}`}>
                        <Icon name={r.tipo === 'med' ? 'pill' : 'calendar'} size={24} />
                      </span>
                      <div className="rec-info">
                        <div className="rec-title">{r.titulo}</div>
                        <div className="rec-detalle muted">{r.detalle}</div>
                      </div>
                      <div className="rec-acciones">
                        {r.tipo === 'med' && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => marcarTomada(r)}
                            disabled={marcando === r.key}
                          >
                            {marcando === r.key ? 'Guardando…' : 'Marcar como tomada'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => avisarCuidador(r)}
                          disabled={yaAvisado || avisando === r.key}
                        >
                          {yaAvisado
                            ? 'Avisado ✓'
                            : avisando === r.key
                            ? 'Avisando…'
                            : 'Avisar a mi cuidador'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CampanaRecordatorios;
