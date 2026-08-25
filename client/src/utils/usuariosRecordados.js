// usuariosRecordados.js -> maneja la lista de usuarios que ya iniciaron sesión
// EN ESTE dispositivo. La idea es que el adulto mayor no tenga que teclear su
// nombre de usuario: lo elige tocando su tarjeta.
//
// Se guarda en localStorage (por dispositivo, no en el servidor). Solo guardo lo
// justo para pintar la tarjeta: nombre de usuario, nombre y rol. NUNCA la clave.

const CLAVE = 'usuariosRecordados';
const MAXIMO = 6; // no llenar la pantalla de tarjetas

// lee la lista (o [] si no hay o el JSON está roto)
export function leerUsuariosRecordados() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

// agrega (o actualiza) un usuario y lo deja primero en la lista. Sin duplicados
// por nombre de usuario. Se llama tras un login exitoso.
export function recordarUsuario({ nombreUsuario, nombre, rol }) {
  if (!nombreUsuario) return;
  const otros = leerUsuariosRecordados().filter(
    (u) => u.nombreUsuario !== nombreUsuario
  );
  const nueva = [{ nombreUsuario, nombre, rol }, ...otros].slice(0, MAXIMO);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nueva));
  } catch {
    // si localStorage está lleno o bloqueado, no pasa nada: solo no recordamos
  }
  return nueva;
}

// saca un usuario de la lista ("¿No eres tú?") y devuelve la lista resultante
export function olvidarUsuario(nombreUsuario) {
  const nueva = leerUsuariosRecordados().filter(
    (u) => u.nombreUsuario !== nombreUsuario
  );
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nueva));
  } catch {
    // ignoro errores de storage
  }
  return nueva;
}
