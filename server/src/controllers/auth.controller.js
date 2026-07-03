// auth.controller.js -> controladores de autenticación.
// Hacen poco a propósito: sacan lo que necesitan de req, llaman al service y
// responden. La lógica de negocio vive en el service y los errores van a next().

import * as authService from '../services/auth.service.js';

// POST /api/auth/registro
export async function registro(req, res, next) {
  try {
    // req.body ya viene validado y limpio desde el middleware validar()
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado); // 201 = creado
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/perfil (protegida)
export async function perfil(req, res, next) {
  try {
    // req.usuario lo puso autenticar() al leer el JWT
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}
