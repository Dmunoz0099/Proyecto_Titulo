// Memorice.jsx -> el juego de memoria (parejas de cartas) para estimulación
// cognitiva. Descubres cartas de a dos y buscas los pares iguales.
// Pensado para adultos mayores: cartas grandes, sin presión de tiempo (mido el
// tiempo solo para el seguimiento, no para apurar), niveles suaves y refuerzo
// positivo al ganar. Cuando gana, le avisa al padre con el resultado para que lo
// guarde como una SesionJuego (puntaje/aciertos/errores/duración).

import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';

// caras de las cartas: emojis grandes y a color, mucho más amigables y fáciles
// de reconocer para un adulto mayor que un icono abstracto.
// Los agrupo por tema para que el jugador elija el que más le guste.
const TEMAS = {
  frutas: { label: 'Frutas', emojis: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍐', '🍒', '🍍', '🥝', '🍑', '🍈'] },
  vehiculos: { label: 'Autos', emojis: ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚜', '🚲', '🛵', '🚂', '✈️', '⛵'] },
  objetos: { label: 'Objetos', emojis: ['📱', '💡', '🔑', '🎈', '🎁', '🔔', '⚽', '📚', '🧸', '🎩', '👓', '⏰'] },
};

// botones de tema (incluye "Variado", que mezcla todos)
const TEMA_OPCIONES = [
  { id: 'frutas', label: 'Frutas' },
  { id: 'vehiculos', label: 'Autos' },
  { id: 'objetos', label: 'Objetos' },
  { id: 'variado', label: 'Variado' },
];

// emojis de un tema; "variado" junta todos
function emojisDeTema(tema) {
  if (tema === 'variado') return Object.values(TEMAS).flatMap((t) => t.emojis);
  return TEMAS[tema].emojis;
}

// niveles: cantidad de PAREJAS (no de cartas)
const NIVELES = [
  { id: 'facil', label: 'Fácil', pares: 4 },
  { id: 'normal', label: 'Normal', pares: 6 },
  { id: 'dificil', label: 'Difícil', pares: 8 },
];

// baraja un arreglo (Fisher–Yates) y devuelve una copia
function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// arma el mazo: elige "pares" emojis del tema, los duplica y baraja
function nuevoMazo(pares, tema) {
  const elegidos = barajar(emojisDeTema(tema)).slice(0, pares);
  return barajar([...elegidos, ...elegidos]).map((emoji, i) => ({
    id: i,
    emoji,
    volteada: false,
    emparejada: false,
  }));
}

// después de emparejar la última pareja espero un momento antes de mostrar el
// modal de victoria: así la última carta alcanza a girar y se ve el tablero
// completo (el giro dura 0.22s en la CSS). Sin esto el modal tapaba el tablero al
// toque y parecía que ganabas sin dar vuelta la última carta.
const DELAY_VICTORIA_MS = 600;

// 78 segundos -> "1:18"
function mmss(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Memorice({ onTerminar }) {
  const [pares, setPares] = useState(6);
  const [tema, setTema] = useState('frutas');
  const [cartas, setCartas] = useState(() => nuevoMazo(6, 'frutas'));
  const [seleccion, setSeleccion] = useState([]); // índices volteados (0..2)
  const [errores, setErrores] = useState(0);
  const [bloqueado, setBloqueado] = useState(false); // mientras evalúo un par
  const [inicio, setInicio] = useState(null); // timestamp del primer clic
  const [transcurrido, setTranscurrido] = useState(0);
  const [ganado, setGanado] = useState(false); // ya están todas las parejas
  const [mostrarVictoria, setMostrarVictoria] = useState(false); // modal a la vista

  // (re)inicia la partida. Puedo cambiar nivel y/o tema; lo que no paso, se
  // queda como está.
  function reiniciar({ pares: p = pares, tema: t = tema } = {}) {
    setPares(p);
    setTema(t);
    setCartas(nuevoMazo(p, t));
    setSeleccion([]);
    setErrores(0);
    setBloqueado(false);
    setInicio(null);
    setTranscurrido(0);
    setGanado(false);
    setMostrarVictoria(false);
  }

  // cronómetro tranqui (solo informativo). Corre del primer clic hasta ganar.
  useEffect(() => {
    if (inicio === null || ganado) return;
    const id = setInterval(
      () => setTranscurrido(Math.round((Date.now() - inicio) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [inicio, ganado]);

  // cuando hay 2 cartas dadas vuelta las comparo: si son iguales quedan
  // emparejadas; si no, se vuelven a ocultar tras un momento.
  useEffect(() => {
    if (seleccion.length !== 2) return;
    setBloqueado(true);
    const [a, b] = seleccion;

    if (cartas[a].emoji === cartas[b].emoji) {
      setCartas((prev) =>
        prev.map((c, i) => (i === a || i === b ? { ...c, emparejada: true } : c))
      );
      setSeleccion([]);
      setBloqueado(false);
    } else {
      setErrores((e) => e + 1);
      const t = setTimeout(() => {
        setCartas((prev) =>
          prev.map((c, i) => (i === a || i === b ? { ...c, volteada: false } : c))
        );
        setSeleccion([]);
        setBloqueado(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [seleccion]); // eslint-disable-line react-hooks/exhaustive-deps

  // detecta la victoria: solo cuando TODAS las cartas están emparejadas (incluida
  // la última, que para emparejarse tuvo que darse vuelta). Congelo el juego al
  // toque (tablero y cronómetro) y guardo la sesión, pero el modal aparece un
  // momento después para que se vea girar la última carta y el tablero completo.
  useEffect(() => {
    if (ganado || cartas.length === 0) return;
    if (cartas.every((c) => c.emparejada)) {
      setGanado(true);
      const dur = inicio ? Math.round((Date.now() - inicio) / 1000) : 0;
      // puntaje simple y fácil de explicar: 100 por pareja, -20 por error
      const puntaje = Math.max(0, pares * 100 - errores * 20);
      onTerminar?.({
        puntaje,
        aciertos: pares,
        errores,
        duracionSegundos: dur,
      });
      const t = setTimeout(() => setMostrarVictoria(true), DELAY_VICTORIA_MS);
      return () => clearTimeout(t);
    }
  }, [cartas]); // eslint-disable-line react-hooks/exhaustive-deps

  function voltear(i) {
    if (bloqueado || ganado) return;
    const c = cartas[i];
    if (c.volteada || c.emparejada || seleccion.length >= 2) return;
    if (inicio === null) setInicio(Date.now());
    setCartas((prev) => prev.map((cc, idx) => (idx === i ? { ...cc, volteada: true } : cc)));
    setSeleccion((prev) => [...prev, i]);
  }

  const parejasHechas = cartas.filter((c) => c.emparejada).length / 2;

  return (
    <div className="memorice">
      {/* barra de control: dificultad + tipo de dibujos + reiniciar */}
      <div className="mem-toolbar">
        <div className="mem-group">
          <span className="mem-group-lab">Dificultad</span>
          <div className="mem-chips" role="group" aria-label="Dificultad">
            {NIVELES.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`btn ${n.pares === pares ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => reiniciar({ pares: n.pares })}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mem-group">
          <span className="mem-group-lab">Dibujos</span>
          <div className="mem-chips" role="group" aria-label="Tipo de dibujos">
            {TEMA_OPCIONES.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`btn ${o.id === tema ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => reiniciar({ tema: o.id })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-ghost mem-reiniciar" onClick={() => reiniciar()}>
          <Icon name="history" size={22} /> Reiniciar
        </button>
      </div>

      {/* marcadores (sin presión: el tiempo es solo informativo) */}
      <div className="mem-stats">
        <div className="mem-stat">
          <span className="mem-stat-num">{parejasHechas}/{pares}</span>
          <span className="mem-stat-lab">Parejas</span>
        </div>
        <div className="mem-stat">
          <span className="mem-stat-num">{errores}</span>
          <span className="mem-stat-lab">Errores</span>
        </div>
        <div className="mem-stat">
          <span className="mem-stat-num">{mmss(transcurrido)}</span>
          <span className="mem-stat-lab">Tiempo</span>
        </div>
      </div>

      {/* el tablero */}
      <div className={`mem-board mem-board-${pares}`}>
        {cartas.map((c, i) => {
          const visible = c.volteada || c.emparejada;
          return (
            <button
              key={c.id}
              type="button"
              className={`mem-card ${visible ? 'is-up' : ''} ${c.emparejada ? 'is-matched' : ''}`}
              onClick={() => voltear(i)}
              aria-label={visible ? 'Carta descubierta' : 'Carta oculta'}
              disabled={ganado}
            >
              <span className="mem-face mem-back" aria-hidden="true">
                <Icon name="puzzle" size={30} />
              </span>
              <span className="mem-face mem-front" aria-hidden="true">
                <span className="mem-emoji">{c.emoji}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* panel de victoria (aparece recién cuando giró la última carta) */}
      {mostrarVictoria && (
        <div className="scrim" role="dialog" aria-modal="true" aria-label="¡Ganaste!">
          <div className="modal mem-win">
            <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="tile tile-primary" style={{ width: 88, height: 88 }}>
                <Icon name="puzzle" size={48} />
              </span>
              <h2 className="t-h2">¡Muy bien!</h2>
              <p className="t-lg muted">Encontraste todas las parejas.</p>
              <div className="mem-resumen">
                <div><b>{pares}</b> parejas</div>
                <div><b>{errores}</b> errores</div>
                <div><b>{mmss(transcurrido)}</b> de tiempo</div>
              </div>
            </div>
            <div className="modal-foot" style={{ flexDirection: 'column' }}>
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => reiniciar()}>
                Jugar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Memorice;
