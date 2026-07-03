// auth.routes.js -> endpoints de autenticación.
// El orden de los middlewares importa: validar() -> (autenticar()) -> controlador.

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';
import { esquemaRegistro, esquemaLogin } from '../validators/auth.validator.js';

const router = Router();

// registro: valida el cuerpo y crea el usuario
router.post('/registro', validar(esquemaRegistro), authController.registro);

// login: valida el cuerpo e inicia sesión
router.post('/login', validar(esquemaLogin), authController.login);

// perfil: protegida, necesita token válido
router.get('/perfil', autenticar, authController.perfil);

export default router;
