// evento-calendario.routes.js -> endpoints del Calendario a largo plazo.
// Mismo encadenado que la agenda. Permisos: listar lo hace cualquiera con
// sesión; crear/editar/eliminar solo CUIDADOR.

import { Router } from 'express';
import * as calendarioController from '../controllers/evento-calendario.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { esquemaEventoCalendario } from '../validators/evento-calendario.validator.js';

const router = Router();

// todas piden sesión
router.use(autenticar);

// lista los eventos del calendario (cualquier rol)
router.get('/', calendarioController.listar);

// crear (solo CUIDADOR)
router.post(
  '/',
  autorizar('CUIDADOR'),
  validar(esquemaEventoCalendario),
  calendarioController.crear
);

// actualizar (solo CUIDADOR)
router.put(
  '/:id',
  autorizar('CUIDADOR'),
  validar(esquemaEventoCalendario),
  calendarioController.actualizar
);

// eliminar (solo CUIDADOR)
router.delete('/:id', autorizar('CUIDADOR'), calendarioController.eliminar);

export default router;
