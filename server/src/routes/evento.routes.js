// evento.routes.js -> endpoints de la Agenda. Mismo encadenado que medicamentos.
// Permisos: listar lo hace cualquiera con sesión; crear/editar/eliminar el CUIDADOR o el FAMILIAR.

import { Router } from 'express';
import * as eventoController from '../controllers/evento.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { esquemaEvento } from '../validators/evento.validator.js';

const router = Router();

// todas piden sesión
router.use(autenticar);

// lista los eventos del día
router.get('/', eventoController.listar);

// crear (CUIDADOR o FAMILIAR)
router.post(
  '/',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaEvento),
  eventoController.crear
);

// actualizar (CUIDADOR o FAMILIAR)
router.put(
  '/:id',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaEvento),
  eventoController.actualizar
);

// eliminar (CUIDADOR o FAMILIAR)
router.delete('/:id', autorizar('CUIDADOR', 'FAMILIAR'), eventoController.eliminar);

export default router;
