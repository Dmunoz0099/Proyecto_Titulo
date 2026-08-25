// vinculacion.routes.js -> endpoints para asociar la cuenta a un adulto mayor.
// Todas piden sesión. Crear al adulto mayor lo hace SOLO el cuidador; unirse por
// código lo puede hacer cualquier rol (familiar, paciente o un segundo cuidador).

import { Router } from 'express';
import * as vinculacionController from '../controllers/vinculacion.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import {
  esquemaCrearPaciente,
  esquemaUnir,
  esquemaCuentaPaciente,
  esquemaPin,
} from '../validators/vinculacion.validator.js';

const router = Router();

// todas piden sesión iniciada
router.use(autenticar);

// ¿estoy vinculado? (y el código si soy cuidador)
router.get('/estado', vinculacionController.estado);

// el cuidador crea al adulto mayor y obtiene un código para compartir
router.post(
  '/paciente',
  autorizar('CUIDADOR'),
  validar(esquemaCrearPaciente),
  vinculacionController.crearPaciente
);

// cualquiera sin vincular se une con el código
router.post('/unir', validar(esquemaUnir), vinculacionController.unir);

// el cuidador crea la cuenta del paciente (usuario + PIN de 4 números, sin correo)
router.post(
  '/cuenta-paciente',
  autorizar('CUIDADOR'),
  validar(esquemaCuentaPaciente),
  vinculacionController.crearCuentaPaciente
);

// el cuidador cambia el PIN del paciente (si lo olvidó, etc.)
router.post(
  '/pin-paciente',
  autorizar('CUIDADOR'),
  validar(esquemaPin),
  vinculacionController.cambiarPinPaciente
);

export default router;
