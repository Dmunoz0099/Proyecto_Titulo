// api/cache.js -> una caché en memoria simple para la data del backend, con la
// idea de "stale-while-revalidate": el componente muestra AL INSTANTE lo último
// que se trajo (si lo tiene) y por detrás vuelve a pedir para refrescar.
//
// El problema que resuelve: cada página hacía su fetch en un useEffect al
// montarse, así que al navegar atrás/adelante (React Router re-monta la ruta) se
// veía el "Cargando…" de nuevo aunque los datos ya los teníamos. Con esta caché,
// al volver a una pantalla los datos aparecen de una y el refresco es invisible.
//
// La caché vive mientras la pestaña esté abierta (es un Map de módulo). Al
// recargar la página (F5) se vacía sola, así que nunca queda "pegada".

import { useState, useEffect, useCallback, useRef } from 'react';

// key -> { datos } con lo último que trajimos de esa key
const cache = new Map();
// key -> Set de setters, para avisar a TODOS los componentes que usan esa key
// cuando cambia (ej: marco una toma en Medicamentos y la campana se entera sola)
const suscriptores = new Map();
// key -> promesa en curso, para que si dos componentes piden lo mismo a la vez
// se comparta una sola petición en lugar de disparar dos
const enVuelo = new Map();

export function leerCache(key) {
  return cache.has(key) ? cache.get(key).datos : undefined;
}

export function escribirCache(key, datos) {
  cache.set(key, { datos });
  const set = suscriptores.get(key);
  if (set) set.forEach((fn) => fn(datos));
}

// borra una key para forzar que la próxima vez se traiga fresca
export function invalidarCache(key) {
  cache.delete(key);
}

function suscribir(key, fn) {
  if (!suscriptores.has(key)) suscriptores.set(key, new Set());
  suscriptores.get(key).add(fn);
  return () => suscriptores.get(key)?.delete(fn);
}

// dispara el fetcher (compartiendo la petición si ya hay una igual en curso) y
// guarda el resultado en la caché (lo que notifica a los suscriptores).
function revalidar(key, fetcher) {
  let p = enVuelo.get(key);
  if (!p) {
    p = Promise.resolve()
      .then(fetcher)
      .then((datos) => {
        escribirCache(key, datos);
        return datos;
      })
      .finally(() => enVuelo.delete(key));
    enVuelo.set(key, p);
  }
  return p;
}

// hook principal: te da la data con caché + refresco en segundo plano.
//   key       -> identifica el recurso ('medicamentos', 'tomas', 'eventos'…)
//   fetcher   -> función que trae la data (una de api/*.js)
//   opciones  -> { inicial: valor por defecto mientras no hay nada }
//
// devuelve { datos, cargando, error, refrescar, mutar }:
//   - refrescar() vuelve a pedir al backend (útil tras crear/editar/borrar).
//   - mutar(nuevo | fn(prev)) actualiza la caché en el acto (updates optimistas),
//     y como notifica a los suscriptores, todas las vistas con esa key se enteran.
export function useRecurso(key, fetcher, opciones = {}) {
  const { inicial } = opciones;

  // guardo el fetcher en un ref para no atarlo a las deps del effect (así puede
  // ser una función inline sin re-disparar todo en cada render)
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [datos, setDatos] = useState(() => {
    const c = leerCache(key);
    return c !== undefined ? c : inicial;
  });
  // solo mostramos "cargando" si NO había nada en caché todavía
  const [cargando, setCargando] = useState(() => leerCache(key) === undefined);
  const [error, setError] = useState(null);

  const refrescar = useCallback(async () => {
    try {
      const frescos = await revalidar(key, () => fetcherRef.current());
      setError(null);
      return frescos;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setCargando(false);
    }
  }, [key]);

  useEffect(() => {
    // me suscribo para enterarme si otro componente cambia esta key
    const off = suscribir(key, setDatos);
    // por si la caché ya cambió entre el primer render y este effect, me sincronizo
    const actual = leerCache(key);
    if (actual !== undefined) setDatos(actual);
    // stale-while-revalidate: siempre refresco por detrás (si hay caché no se ve)
    refrescar().catch(() => {});
    return off;
  }, [key, refrescar]);

  const mutar = useCallback(
    (updater) => {
      const actual = leerCache(key);
      const base = actual !== undefined ? actual : inicial;
      const nuevo = typeof updater === 'function' ? updater(base) : updater;
      escribirCache(key, nuevo);
    },
    [key, inicial]
  );

  return { datos, cargando, error, refrescar, mutar };
}
