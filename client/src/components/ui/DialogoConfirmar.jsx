// DialogoConfirmar.jsx -> un diálogo de confirmación propio de la app (sí/no),
// para reemplazar a window.confirm. El nativo no siempre responde en el navegador
// del celular (iOS Safari), así que las acciones que piden confirmar (borrar un
// medicamento, borrar una actividad) usan este modal en su lugar. Es accesible
// (role="alertdialog") y con botones grandes, en línea con el resto del portal.

import { Icon } from './Icon.jsx';

export function DialogoConfirmar({
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar',
  // por defecto es para borrar; otras acciones (desvincular, renovar el código)
  // pasan su propio ícono y texto mientras procesa
  icono = 'trash',
  textoProcesando = 'Eliminando…',
  procesando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className="scrim" onClick={onCancelar}>
      <div
        className="modal modal-confirm"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="modal-body">
          <h2 className="t-h2">{titulo}</h2>
          {mensaje && <p className="t-body muted" style={{ margin: 0 }}>{mensaje}</p>}
        </div>
        <div className="modal-foot">
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onCancelar} disabled={procesando}>
            {textoCancelar}
          </button>
          <button className="btn btn-danger" onClick={onConfirmar} disabled={procesando}>
            <Icon name={icono} size={22} /> {procesando ? textoProcesando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DialogoConfirmar;
