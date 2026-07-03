// autorizar.js -> control de acceso por rol. Va siempre después de autenticar()
// (que ya dejó req.usuario). Le paso los roles que pueden pasar y bloqueo al resto.
//   router.post('/medicamentos', autenticar, autorizar('CUIDADOR'), crear)

import { crearError } from '../utils/errores.js';

// uso ...rolesPermitidos para aceptar uno o varios:
//   autorizar('CUIDADOR')             -> solo cuidadores
//   autorizar('CUIDADOR', 'FAMILIAR') -> cuidadores o familiares
export function autorizar(...rolesPermitidos) {
  // devuelve el middleware de verdad (una fábrica de middlewares)
  return (req, res, next) => {
    // si alguien lo usa sin autenticar antes, no hay usuario
    if (!req.usuario) {
      return next(crearError(401, 'No autenticado'));
    }

    // rol fuera de la lista -> 403 (está logueado pero no puede)
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(crearError(403, 'No tienes permiso para esta acción'));
    }

    next();
  };
}
