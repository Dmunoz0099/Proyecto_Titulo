// codigo.js -> genera los códigos cortos de invitación (ej: "CM-7K3QP").
// La idea es que sea fácil de dictar por teléfono o anotar en un papel, así que
// dejo fuera las letras/números que se confunden (0/O, 1/I/L) y todo en mayúscula.

// alfabeto sin caracteres ambiguos
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// arma un código con prefijo "CM-" y N caracteres al azar del alfabeto de arriba.
export function generarCodigo(largo = 5) {
  let cuerpo = '';
  for (let i = 0; i < largo; i++) {
    cuerpo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `CM-${cuerpo}`;
}

// normaliza lo que teclea la persona: saca espacios, pasa a mayúscula y le pone
// el prefijo "CM-" si lo escribió sin él. Así "7k3qp" y "cm-7K3QP" valen igual.
export function normalizarCodigo(texto = '') {
  let limpio = texto.trim().toUpperCase().replace(/\s+/g, '');
  if (!limpio.startsWith('CM-')) {
    limpio = `CM-${limpio.replace(/^CM/, '')}`;
  }
  return limpio;
}
