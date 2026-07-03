// Logo.jsx -> el logo de "CuidaMayor": dos figuras inclinadas dándose un abrazo,
// hechas con formas simples. Es un SVG (no una imagen), así escala sin pixelarse
// y toma los colores de la paleta. Lo usan login y registro.

export function Logo({ size = 54 }) {
  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="CuidaMayor"
    >
      <circle cx="32" cy="32" r="32" style={{ fill: '#ffffff', opacity: 0.55 }} />
      {/* la de la izquierda (verde) */}
      <g transform="rotate(-12 28 36)">
        <rect x="18" y="30" width="20" height="26" rx="10" style={{ fill: 'var(--primary)' }} />
        <circle cx="28" cy="24" r="8" style={{ fill: 'var(--primary)' }} />
      </g>
      {/* la de la derecha (azul) */}
      <g transform="rotate(12 36 36)">
        <rect x="26" y="30" width="20" height="26" rx="10" style={{ fill: 'var(--accent2)' }} />
        <circle cx="36" cy="24" r="8" style={{ fill: 'var(--accent2)' }} />
      </g>
      {/* el brazo que abraza */}
      <rect
        x="20"
        y="38"
        width="24"
        height="9"
        rx="4.5"
        style={{ fill: 'color-mix(in oklab, var(--primary), white 30%)', opacity: 0.9 }}
      />
    </svg>
  );
}

export default Logo;
