// vinculacion.routes.js -> endpoints para asociar la cuenta a un adulto mayor.
// Todas piden sesión. El FAMILIAR es quien administra: crea al adulto mayor, crea
// las cuentas del paciente y de la persona cuidadora, y maneja los accesos
// (incluido el código de invitación, que solo él ve y renueva).
// Unirse por código: cuidador u otro familiar (el paciente nunca, su cuenta la
// crea la familia).

import { Router } from 'express';
import * as vinculacionController from '../controllers/vinculacion.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import {
  esquemaCrearPaciente,
  esquemaUnir,
  esquemaCuentaPaciente,
  esquemaCuentaCuidador,
  esquemaPin,
} from '../validators/vinculacion.validator.js';

const router = Router();

// todas piden sesión iniciada
router.use(autenticar);

// ¿estoy vinculado? (y el código, solo si soy familiar)
router.get('/estado', vinculacionController.estado);

// la red de apoyo: adulto mayor + personas conectadas (cualquier rol vinculado)
router.get('/red', vinculacionController.redApoyo);

// quitar a una persona de la red de apoyo (p. ej. cuidador que renuncia).
// Solo el FAMILIAR; el service protege al paciente y evita que alguien se quite
// a sí mismo.
router.delete(
  '/miembro/:id',
  autorizar('FAMILIAR'),
  vinculacionController.desvincular
);

// el familiar crea al adulto mayor y obtiene un código para compartir
router.post(
  '/paciente',
  autorizar('FAMILIAR'),
  validar(esquemaCrearPaciente),
  vinculacionController.crearPaciente
);

// una cuidadora u otro familiar sin vincular se une con el código
router.post(
  '/unir',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaUnir),
  vinculacionController.unir
);

// el familiar genera un código nuevo; el anterior deja de servir al toque
// (los que ya están conectados no pierden nada)
router.post('/codigo', autorizar('FAMILIAR'), vinculacionController.renovarCodigo);

// crea la cuenta del paciente (usuario + PIN de 4 números, sin correo). Solo el
// FAMILIAR, que es el rol estable de la red.
router.post(
  '/cuenta-paciente',
  autorizar('FAMILIAR'),
  validar(esquemaCuentaPaciente),
  vinculacionController.crearCuentaPaciente
);

// cambia el PIN del paciente (si lo olvidó, etc.) — mismo criterio de roles.
router.post(
  '/pin-paciente',
  autorizar('FAMILIAR'),
  validar(esquemaPin),
  vinculacionController.cambiarPinPaciente
);

// el familiar le crea la cuenta a la persona cuidadora (queda ya vinculada).
// Es la otra opción a pasarle el código para que se registre ella misma.
router.post(
  '/cuenta-cuidador',
  autorizar('FAMILIAR'),
  validar(esquemaCuentaCuidador),
  vinculacionController.crearCuentaCuidador
);

export default router;
