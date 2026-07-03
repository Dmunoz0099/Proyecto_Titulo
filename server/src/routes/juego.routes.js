// juego.routes.js -> endpoints de los juegos.
// Orden: autenticar -> (autorizar) -> validar -> controlador.
// Registrar sesión lo hace el PACIENTE (juega) o el CUIDADOR (para demostrar);
// listar sesiones (seguimiento) cualquiera con sesión.

import { Router } from 'express';
import * as juegoController from '../controllers/juego.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { esquemaSesion } from '../validators/juego.validator.js';

const router = Router();

// todas piden sesión
router.use(autenticar);

// guarda el resultado de una partida
router.post(
  '/sesiones',
  autorizar('PACIENTE', 'CUIDADOR'),
  validar(esquemaSesion),
  juegoController.registrarSesion
);

// historial de partidas (seguimiento)
router.get('/sesiones', juegoController.listarSesiones);

export default router;
