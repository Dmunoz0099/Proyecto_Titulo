// medicamento.routes.js -> endpoints de medicamentos.
// Orden de middlewares: autenticar -> (autorizar) -> validar -> controlador.
// Permisos: listar/registrar toma/historial lo hace cualquiera con sesión;
// crear/editar/eliminar el CUIDADOR o el FAMILIAR.

import { Router } from 'express';
import * as medicamentoController from '../controllers/medicamento.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import {
  esquemaMedicamento,
  esquemaToma,
} from '../validators/medicamento.validator.js';

const router = Router();

// todo este módulo pide sesión
router.use(autenticar);

// lista los medicamentos activos
router.get('/', medicamentoController.listar);

// todas las tomas del adulto mayor.
// Ojo: va antes de "/:id/tomas" porque es una ruta literal distinta.
router.get('/tomas', medicamentoController.listarTomas);

// crear (CUIDADOR o FAMILIAR)
router.post(
  '/',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaMedicamento),
  medicamentoController.crear
);

// actualizar (CUIDADOR o FAMILIAR)
router.put(
  '/:id',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaMedicamento),
  medicamentoController.actualizar
);

// borrado lógico (CUIDADOR o FAMILIAR)
router.delete('/:id', autorizar('CUIDADOR', 'FAMILIAR'), medicamentoController.eliminar);

// registrar una toma
router.post(
  '/:id/tomas',
  validar(esquemaToma),
  medicamentoController.registrarToma
);

// historial de tomas
router.get('/:id/tomas', medicamentoController.historial);

export default router;
