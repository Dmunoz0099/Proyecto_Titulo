// alerta.routes.js -> endpoints de las alertas SOS.
// Orden: autenticar -> autorizar -> validar -> controlador.
// Acá se ve la diferenciación por rol: crear la alerta es SOLO del PACIENTE
// (su botón "Necesito ayuda"); listar y atender son del CUIDADOR o FAMILIAR.

import { Router } from 'express';
import * as alertaController from '../controllers/alerta.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { esquemaAlerta } from '../validators/alerta.validator.js';

const router = Router();

// todas piden sesión
router.use(autenticar);

// el PACIENTE pide ayuda
router.post(
  '/',
  autorizar('PACIENTE'),
  validar(esquemaAlerta),
  alertaController.crear
);

// cuidador/familiar ven las alertas
router.get('/', autorizar('CUIDADOR', 'FAMILIAR'), alertaController.listar);

// cuidador/familiar la marcan como atendida
router.post(
  '/:id/atender',
  autorizar('CUIDADOR', 'FAMILIAR'),
  alertaController.atender
);

export default router;
