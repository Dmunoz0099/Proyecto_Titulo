// Icon.jsx -> iconos SVG de trazo (line icons). Reemplaza al "ui.jsx" de los
// prototipos. Cada icono se pinta con currentColor, así hereda el color del
// contenedor. Uso: <Icon name="pill" size={28} />.
//   size -> tamaño en px (ancho y alto)
//   stroke -> grosor del trazo (2 por defecto)
// Si el nombre no existe, muestro un puntito neutro para no romper la UI.

// cada icono es solo el "interior" del <svg> (los trazos). viewBox 24x24,
// trazos redondeados para que se vea amable.
const ICONOS = {
  pill: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <path d="M12 8v8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  edit: (
    <>
      <path d="M4 20h4l10-10a2 2 0 0 0-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M16.5 19a6 6 0 0 0-2-4.5" />
    </>
  ),
  puzzle: (
    <path d="M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-3H4a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h4V4z" />
  ),
  walk: (
    <>
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M13 8l-3 3 2 3-1 6M13 8l3 2 3 1M10 11l-3 5" />
    </>
  ),
  cup: (
    <>
      <path d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
      <path d="M17 9h2.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M7 3v2M11 3v2" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  phone: (
    <path d="M5 3h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
  ),
  drop: <path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z" />,
  bed: (
    <>
      <path d="M3 8v10M3 12h18v6M21 12v6" />
      <path d="M3 12V9a1 1 0 0 1 1-1h7a3 3 0 0 1 3 3v1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  // salir/cerrar sesión: puerta con flecha saliendo
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  // salvavidas: el del botón de ayuda (SOS) del paciente
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
    </>
  ),

  // --- actividades de agenda / calendario (agregados) ---
  // control médico: línea de latido (electro)
  heartpulse: <path d="M2 12h4l2-5 4 10 2-6 2 1h6" />,
  // dentista: muela
  tooth: (
    <path d="M7 3c-2 0-3.5 1.6-3.5 4.5 0 3 .8 5 1.6 9 .5 2.2 2.4 2.2 2.9 0l.6-3.6c.2-1.1 1.6-1.1 1.8 0l.6 3.6c.5 2.2 2.4 2.2 2.9 0 .8-4 1.6-6 1.6-9C15.5 4.6 14 3 12 3c-1.4 0-1.8.8-2.5.8S8.4 3 7 3z" />
  ),
  // vacuna / inyección: jeringa
  syringe: (
    <>
      <path d="M13 3l8 8M17.5 6.5l-2 2" />
      <path d="M14 9l-8.5 8.5L3 19l1.5-2.5L13 8" />
      <path d="M6.5 14.5l3 3" />
    </>
  ),
  // visita familiar / cariño: corazón
  heart: (
    <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20z" />
  ),
  // cumpleaños: regalo
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11" />
      <path d="M12 9c-.8-2-1.8-4.5-3.8-4.5A2 2 0 0 0 8 9M12 9c.8-2 1.8-4.5 3.8-4.5A2 2 0 0 1 16 9" />
    </>
  ),
  // misa / iglesia
  church: (
    <>
      <path d="M12 2v5M9.5 4.2h5" />
      <path d="M12 7l7 4.5V21H5v-9.5L12 7z" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
  // taller / centro de madres: libro
  book: (
    <>
      <path d="M4 4.5h9a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4V4.5z" />
      <path d="M20 4.5h-5a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h5V4.5z" />
    </>
  ),
  // paseo / parque: árbol
  tree: (
    <>
      <path d="M12 3l5 7h-3l3 5H7l3-5H7l5-7z" />
      <path d="M12 15v6" />
    </>
  ),
  // transporte: micro / bus
  bus: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M3 11h18M7 16.5v2M17 16.5v2" />
      <circle cx="7.5" cy="13.5" r="1" />
      <circle cx="16.5" cy="13.5" r="1" />
    </>
  ),
  // compras / feria: carrito
  cart: (
    <>
      <path d="M3 4h2l2.2 11h10.3l2-8H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  // trámite / banco
  bank: (
    <path d="M3 9.5l9-5.5 9 5.5M4.5 9.5h15M6 11v6M10 11v6M14 11v6M18 11v6M3.5 20h17" />
  ),
  // peluquería: tijeras
  scissors: (
    <>
      <circle cx="6" cy="6.5" r="2.4" />
      <circle cx="6" cy="17.5" r="2.4" />
      <path d="M8 8l12 9.5M8 16L20 6.5" />
    </>
  ),
};

export function Icon({ name, size = 24, stroke = 2, ...resto }) {
  const contenido = ICONOS[name] || <circle cx="12" cy="12" r="2.5" />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {contenido}
    </svg>
  );
}

export default Icon;
