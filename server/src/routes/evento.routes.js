// evento.routes.js -> endpoints de la Agenda. Mismo encadenado que medicamentos.
// Permisos: listar lo hace cualquiera con sesión; crear/editar/eliminar solo CUIDADOR.

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

// crear (solo CUIDADOR)
router.post(
  '/',
  autorizar('CUIDADOR'),
  validar(esquemaEvento),
  eventoController.crear
);

// actualizar (solo CUIDADOR)
router.put(
  '/:id',
  autorizar('CUIDADOR'),
  validar(esquemaEvento),
  eventoController.actualizar
);

// eliminar (solo CUIDADOR)
router.delete('/:id', autorizar('CUIDADOR'), eventoController.eliminar);

export default router;
