// vinculacion.routes.js -> endpoints para asociar la cuenta a un adulto mayor.
// Todas piden sesión. El FAMILIAR es quien administra: crea al adulto mayor, crea
// las cuentas del paciente y de la persona cuidadora, y maneja los accesos.
// Unirse por código lo puede hacer cualquier rol (cuidador, otro familiar...).

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

// ¿estoy vinculado? (y el código si soy cuidador)
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

// cualquiera sin vincular se une con el código
router.post('/unir', validar(esquemaUnir), vinculacionController.unir);

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
