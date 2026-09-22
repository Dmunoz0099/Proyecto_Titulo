// ScrollToTop -> cada vez que cambia la ruta, sube el scroll al inicio.
// React Router conserva la posición previa entre vistas y eso hacía que al
// entrar a un módulo quedaras a mitad de página; esto lo evita.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
