// evento-calendario.routes.js -> endpoints del Calendario a largo plazo.
// Mismo encadenado que la agenda. Permisos: listar lo hace cualquiera con
// sesión; crear/editar/eliminar el CUIDADOR o el FAMILIAR.

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

// crear (CUIDADOR o FAMILIAR)
router.post(
  '/',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaEventoCalendario),
  calendarioController.crear
);

// actualizar (CUIDADOR o FAMILIAR)
router.put(
  '/:id',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaEventoCalendario),
  calendarioController.actualizar
);

// eliminar (CUIDADOR o FAMILIAR)
router.delete('/:id', autorizar('CUIDADOR', 'FAMILIAR'), calendarioController.eliminar);

export default router;
