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

// la red de apoyo: adulto mayor + personas conectadas (cualquier rol vinculado)
router.get('/red', vinculacionController.redApoyo);

// quitar a una persona de la red de apoyo (p. ej. cuidador que renuncia).
// Lo pueden hacer el CUIDADOR o el FAMILIAR; el service protege al paciente y
// evita que alguien se quite a sí mismo.
router.delete(
  '/miembro/:id',
  autorizar('CUIDADOR', 'FAMILIAR'),
  vinculacionController.desvincular
);

// el cuidador crea al adulto mayor y obtiene un código para compartir
router.post(
  '/paciente',
  autorizar('CUIDADOR'),
  validar(esquemaCrearPaciente),
  vinculacionController.crearPaciente
);

// cualquiera sin vincular se une con el código
router.post('/unir', validar(esquemaUnir), vinculacionController.unir);

// crea la cuenta del paciente (usuario + PIN de 4 números, sin correo). Ahora la
// gestiona el FAMILIAR (rol estable de la red); se deja también al CUIDADOR para
// no bloquear cuentas antiguas donde él la creó.
router.post(
  '/cuenta-paciente',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaCuentaPaciente),
  vinculacionController.crearCuentaPaciente
);

// cambia el PIN del paciente (si lo olvidó, etc.) — mismo criterio de roles.
router.post(
  '/pin-paciente',
  autorizar('CUIDADOR', 'FAMILIAR'),
  validar(esquemaPin),
  vinculacionController.cambiarPinPaciente
);

export default router;
