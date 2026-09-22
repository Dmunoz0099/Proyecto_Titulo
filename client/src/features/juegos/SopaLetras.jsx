// SopaLetras.jsx -> el segundo juego de estimulación cognitiva: una sopa de
// letras. Se busca una lista de palabras escondidas en un tablero de letras.
// Pensado para adultos mayores igual que el Memorice: celdas grandes, alto
// contraste, palabras cortas y comunes, sin presión de tiempo (el cronómetro es
// solo informativo). Cuando encuentra todas las palabras avisa al padre con el
// resultado para guardarlo como SesionJuego (tipoJuego = SOPA_LETRAS).

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon.jsx';

// bancos de palabras por tema. Todas en MAYÚSCULAS, sin tildes ni Ñ, cortas y
// conocidas para que sea fácil. Se eligen según la dificultad (largo máximo).
const TEMAS = {
  animales: {
    label: 'Animales',
    palabras: ['GATO', 'PATO', 'LEON', 'OSO', 'VACA', 'MONO', 'LORO', 'PAVO', 'PERRO', 'POLLO', 'RATON', 'CABRA', 'CERDO', 'CONEJO'],
  },
  frutas: {
    label: 'Frutas',
    palabras: ['PERA', 'UVA', 'KIWI', 'LIMA', 'COCO', 'HIGO', 'MANGO', 'MELON', 'LIMON', 'CEREZA', 'PAPAYA', 'PLATANO'],
  },
  casa: {
    label: 'Casa',
    palabras: ['MESA', 'CAMA', 'VASO', 'SOFA', 'TAZA', 'OLLA', 'PISO', 'LLAVE', 'PLATO', 'PARED', 'TECHO', 'PUERTA'],
  },
};

const TEMA_OPCIONES = [
  { id: 'animales', label: 'Animales' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'casa', label: 'Casa' },
  { id: 'variado', label: 'Variado' },
];

// niveles: tamaño del tablero, cuántas palabras, largo máximo y direcciones.
// Empieza chico y suave (solo horizontal y vertical); el difícil suma diagonal.
const NIVELES = [
  { id: 'facil', label: 'Fácil', size: 8, cantidad: 5, maxLargo: 4, diagonales: false },
  { id: 'normal', label: 'Normal', size: 10, cantidad: 6, maxLargo: 6, diagonales: false },
  { id: 'dificil', label: 'Difícil', size: 10, cantidad: 8, maxLargo: 6, diagonales: true },
];

const ABECEDARIO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// direcciones de colocación (fila, columna). Sin invertidas: siempre se leen de
// izquierda a derecha / de arriba hacia abajo, más amable para el adulto mayor.
const DIRS_RECTAS = [
  { dr: 0, dc: 1 }, // horizontal →
  { dr: 1, dc: 0 }, // vertical ↓
];
const DIR_DIAGONAL = { dr: 1, dc: 1 }; // diagonal ↘

// baraja un arreglo (Fisher–Yates) y devuelve una copia
function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function letraAlAzar() {
  return ABECEDARIO[Math.floor(Math.random() * ABECEDARIO.length)];
}

// palabras candidatas de un nivel/tema: filtra por largo máximo y elige "cantidad"
function elegirPalabras(tema, cantidad, maxLargo) {
  const banco =
    tema === 'variado'
      ? Object.values(TEMAS).flatMap((t) => t.palabras)
      : TEMAS[tema].palabras;
  const aptas = barajar(banco.filter((p) => p.length <= maxLargo));
  return aptas.slice(0, cantidad);
}

// clave canónica de un conjunto de celdas (para comparar sin importar el orden
// ni la dirección en que el jugador las seleccionó)
function claveCeldas(celdas) {
  return celdas.map(({ r, c }) => `${r},${c}`).sort().join('|');
}

// intenta armar un tablero: coloca cada palabra en una dirección/posición que
// calce (celda vacía o con la misma letra) y rellena el resto al azar. Si alguna
// palabra no cabe tras varios intentos, devuelve null para reintentar de cero.
function intentarTablero(size, palabras, diagonales) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const dirs = diagonales ? [...DIRS_RECTAS, DIR_DIAGONAL] : DIRS_RECTAS;
  const solucion = [];

  for (const palabra of palabras) {
    let colocada = false;

    for (let intento = 0; intento < 120 && !colocada; intento++) {
      const { dr, dc } = dirs[Math.floor(Math.random() * dirs.length)];
      const largo = palabra.length;
      const filaMax = dr === 0 ? size : size - largo;
      const colMax = dc === 0 ? size : size - largo;
      if (filaMax <= 0 || colMax <= 0) continue;

      const r0 = Math.floor(Math.random() * filaMax);
      const c0 = Math.floor(Math.random() * colMax);

      // ¿calza? (vacío o misma letra en cada celda del recorrido)
      let calza = true;
      for (let i = 0; i < largo; i++) {
        const celda = grid[r0 + dr * i][c0 + dc * i];
        if (celda !== '' && celda !== palabra[i]) {
          calza = false;
          break;
        }
      }
      if (!calza) continue;

      // colocar
      const celdas = [];
      for (let i = 0; i < largo; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        grid[r][c] = palabra[i];
        celdas.push({ r, c });
      }
      solucion.push({ palabra, celdas, clave: claveCeldas(celdas) });
      colocada = true;
    }

    if (!colocada) return null; // que reintente todo el tablero
  }

  // relleno los huecos con letras al azar
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = letraAlAzar();
    }
  }

  return { grid, solucion };
}

// arma un tablero reintentando de cero si alguna palabra no cupo
function generarSopa(size, palabras, diagonales) {
  for (let intento = 0; intento < 40; intento++) {
    const t = intentarTablero(size, palabras, diagonales);
    if (t) return t;
  }
  // caso extremo (no debería pasar con estas palabras cortas): tablero sin nada
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, letraAlAzar)
  );
  return { grid, solucion: [] };
}

// las celdas de una línea recta entre dos puntos, si es que forman una línea
// válida (horizontal, vertical o diagonal). Si no, devuelve null.
function celdasEnLinea(a, b) {
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  const esRecta =
    (dr === 0 && dc !== 0) ||
    (dc === 0 && dr !== 0) ||
    (Math.abs(dr) === Math.abs(dc) && dr !== 0);
  if (!esRecta) return null;

  const pasos = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  const celdas = [];
  for (let i = 0; i <= pasos; i++) {
    celdas.push({ r: a.r + sr * i, c: a.c + sc * i });
  }
  return celdas;
}

// 78 segundos -> "1:18"
function mmss(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function SopaLetras({ onTerminar }) {
  const [nivel, setNivel] = useState('facil');
  const [tema, setTema] = useState('animales');

  // el tablero + su solución. Lo regenero al reiniciar / cambiar nivel o tema.
  const [juego, setJuego] = useState(() => {
    const n = NIVELES[0];
    const palabras = elegirPalabras('animales', n.cantidad, n.maxLargo);
    return { size: n.size, ...generarSopa(n.size, palabras, n.diagonales) };
  });

  const [seleccion, setSeleccion] = useState([]); // celdas del camino en curso
  const [encontradas, setEncontradas] = useState(() => new Set()); // palabras
  const [celdasOk, setCeldasOk] = useState(() => new Set()); // "r,c" ya resueltas
  const [errores, setErrores] = useState(0);
  const [inicio, setInicio] = useState(null); // timestamp del primer toque
  const [transcurrido, setTranscurrido] = useState(0);
  const [ganado, setGanado] = useState(false);
  const [mostrarVictoria, setMostrarVictoria] = useState(false);

  const totalPalabras = juego.solucion.length;

  // (re)inicia la partida. Puedo cambiar nivel y/o tema; lo que no paso, se queda.
  function reiniciar({ nivel: nv = nivel, tema: tm = tema } = {}) {
    const n = NIVELES.find((x) => x.id === nv);
    const palabras = elegirPalabras(tm, n.cantidad, n.maxLargo);
    setNivel(nv);
    setTema(tm);
    setJuego({ size: n.size, ...generarSopa(n.size, palabras, n.diagonales) });
    setSeleccion([]);
    setEncontradas(new Set());
    setCeldasOk(new Set());
    setErrores(0);
    setInicio(null);
    setTranscurrido(0);
    setGanado(false);
    setMostrarVictoria(false);
  }

  // cronómetro tranqui (solo informativo): del primer toque hasta ganar
  useEffect(() => {
    if (inicio === null || ganado) return;
    const id = setInterval(
      () => setTranscurrido(Math.round((Date.now() - inicio) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [inicio, ganado]);

  // victoria: cuando están todas las palabras. Congelo y guardo la sesión; el
  // modal aparece un momento después para alcanzar a ver el tablero completo.
  useEffect(() => {
    if (ganado || totalPalabras === 0) return;
    if (encontradas.size === totalPalabras) {
      setGanado(true);
      const dur = inicio ? Math.round((Date.now() - inicio) / 1000) : 0;
      // puntaje simple y explicable, al estilo del Memorice: 100 por palabra,
      // menos 20 por cada intento equivocado (nunca baja de 0).
      const puntaje = Math.max(0, totalPalabras * 100 - errores * 20);
      onTerminar?.({
        puntaje,
        aciertos: totalPalabras,
        errores,
        duracionSegundos: dur,
      });
      const t = setTimeout(() => setMostrarVictoria(true), 500);
      return () => clearTimeout(t);
    }
  }, [encontradas]); // eslint-disable-line react-hooks/exhaustive-deps

  // toque en una celda. Se va armando la palabra letra por letra: la primera
  // marca el inicio y cada toque siguiente extiende el camino en línea recta
  // (horizontal, vertical o diagonal). Cuando el camino calza con una palabra, se
  // marca sola. Tocar la primera y la última letra también funciona (salta el
  // camino de una). Tocar de nuevo el inicio cancela.
  function tocarCelda(r, c) {
    if (ganado) return;
    if (inicio === null) setInicio(Date.now());
    const cel = { r, c };

    // primera letra
    if (seleccion.length === 0) {
      setSeleccion([cel]);
      return;
    }

    const partida = seleccion[0];

    // toco de nuevo la primera letra -> cancelo la selección
    if (partida.r === r && partida.c === c) {
      setSeleccion([]);
      return;
    }

    const linea = celdasEnLinea(partida, cel);

    // si la celda no está en línea recta con el inicio, empiezo un camino nuevo
    // acá. Si venía armando algo de 2+ letras y lo abandono, cuenta como intento.
    if (!linea) {
      if (seleccion.length >= 2) setErrores((e) => e + 1);
      setSeleccion([cel]);
      return;
    }

    // ¿el camino ya calza justo con una palabra pendiente?
    const clave = claveCeldas(linea);
    const acierto = juego.solucion.find(
      (s) => s.clave === clave && !encontradas.has(s.palabra)
    );

    if (acierto) {
      setEncontradas((prev) => new Set(prev).add(acierto.palabra));
      setCeldasOk((prev) => {
        const n = new Set(prev);
        linea.forEach(({ r: rr, c: cc }) => n.add(`${rr},${cc}`));
        return n;
      });
      setSeleccion([]);
    } else {
      // todavía no completa la palabra: resalto el camino y espero más letras
      setSeleccion(linea);
    }
  }

  const palabrasOrdenadas = useMemo(
    () => [...juego.solucion].sort((a, b) => a.palabra.localeCompare(b.palabra)),
    [juego]
  );

  // celdas resaltadas del camino en curso (para pintarlas todas, no solo el inicio)
  const enSeleccion = new Set(seleccion.map(({ r, c }) => `${r},${c}`));

  return (
    <div className="sopa">
      {/* barra de control: dificultad + tema + reiniciar (igual que el Memorice) */}
      <div className="mem-toolbar">
        <div className="mem-group">
          <span className="mem-group-lab">Dificultad</span>
          <div className="mem-chips" role="group" aria-label="Dificultad">
            {NIVELES.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`btn ${n.id === nivel ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => reiniciar({ nivel: n.id })}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mem-group">
          <span className="mem-group-lab">Tema</span>
          <div className="mem-chips" role="group" aria-label="Tema de las palabras">
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
          <span className="mem-stat-num">{encontradas.size}/{totalPalabras}</span>
          <span className="mem-stat-lab">Palabras</span>
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

      <p className="sopa-ayuda muted">
        Toca las letras de cada palabra, una por una (o toca la primera y la última).
      </p>

      {/* el tablero */}
      <div
        className="sopa-board"
        style={{ gridTemplateColumns: `repeat(${juego.size}, 1fr)` }}
      >
        {juego.grid.map((fila, r) =>
          fila.map((letra, c) => {
            const ok = celdasOk.has(`${r},${c}`);
            const activa = enSeleccion.has(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={`sopa-celda ${ok ? 'is-ok' : ''} ${activa ? 'is-activa' : ''}`}
                onClick={() => tocarCelda(r, c)}
                disabled={ganado}
                aria-label={`Letra ${letra}`}
              >
                {letra}
              </button>
            );
          })
        )}
      </div>

      {/* lista de palabras a buscar */}
      <div className="sopa-lista">
        {palabrasOrdenadas.map((s) => {
          const hecha = encontradas.has(s.palabra);
          return (
            <span key={s.palabra} className={`sopa-palabra ${hecha ? 'is-ok' : ''}`}>
              {hecha && <Icon name="check" size={18} stroke={2.5} />}
              {s.palabra}
            </span>
          );
        })}
      </div>

      {/* panel de victoria */}
      {mostrarVictoria && (
        <div className="scrim" role="dialog" aria-modal="true" aria-label="¡Ganaste!">
          <div className="modal mem-win">
            <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="tile tile-primary" style={{ width: 88, height: 88 }}>
                <Icon name="grid" size={48} />
              </span>
              <h2 className="t-h2">¡Muy bien!</h2>
              <p className="t-lg muted">Encontraste todas las palabras.</p>
              <div className="mem-resumen">
                <div><b>{totalPalabras}</b> palabras</div>
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

export default SopaLetras;
