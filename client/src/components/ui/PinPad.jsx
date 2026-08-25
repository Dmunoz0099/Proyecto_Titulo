// PinPad.jsx -> teclado numérico grande para escribir un PIN de 4 dígitos.
// Pensado para el adulto mayor: botones grandes, sin teclear texto. Se usa tanto
// en el login (el paciente entra con su PIN) como cuando el cuidador crea o
// cambia el PIN.
//
// Props:
//   value      -> el PIN actual (string de hasta 4 dígitos)
//   onChange   -> (nuevoValor) cada vez que cambia
//   onComplete -> (valor) se llama al llegar a 4 dígitos (ej: para enviar solo)
//   disabled   -> desactiva los botones (mientras se envía)

import './PinPad.css';

const LARGO = 4;

export function PinPad({ value = '', onChange, onComplete, disabled = false }) {
  function agregar(digito) {
    if (disabled || value.length >= LARGO) return;
    const nuevo = value + digito;
    onChange?.(nuevo);
    if (nuevo.length === LARGO) onComplete?.(nuevo);
  }

  function borrar() {
    if (disabled || value.length === 0) return;
    onChange?.(value.slice(0, -1));
  }

  return (
    <div className="pinpad">
      {/* los 4 casilleros que muestran cuántos dígitos van */}
      <div className="pin-display" aria-hidden="true">
        {Array.from({ length: LARGO }).map((_, i) => (
          <span key={i} className={`pin-dot ${i < value.length ? 'lleno' : ''}`}>
            {i < value.length ? '•' : ''}
          </span>
        ))}
      </div>

      {/* teclado 1-9, luego borrar / 0 */}
      <div className="pin-teclas">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            className="pin-tecla"
            onClick={() => agregar(String(n))}
            disabled={disabled || value.length >= LARGO}
          >
            {n}
          </button>
        ))}
        {/* hueco para alinear el 0 al centro */}
        <span className="pin-tecla vacia" aria-hidden="true"></span>
        <button
          type="button"
          className="pin-tecla"
          onClick={() => agregar('0')}
          disabled={disabled || value.length >= LARGO}
        >
          0
        </button>
        <button
          type="button"
          className="pin-tecla borrar"
          onClick={borrar}
          disabled={disabled || value.length === 0}
          aria-label="Borrar el último número"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}

export default PinPad;
