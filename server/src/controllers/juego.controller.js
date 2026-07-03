// juego.controller.js -> controladores de los juegos.
// Sin lógica de negocio (va en el service): leen de req, llaman al service y
// responden, mandando los errores a next().

import * as juegoService from '../services/juego.service.js';

// POST /api/juegos/sesiones (PACIENTE o CUIDADOR)
export async function registrarSesion(req, res, next) {
  try {
    const sesion = await juegoService.registrarSesion(req.usuario.id, req.body);
    res.status(201).json(sesion);
  } catch (error) {
    next(error);
  }
}

// GET /api/juegos/sesiones (cualquier rol con sesión)
export async function listarSesiones(req, res, next) {
  try {
    const sesiones = await juegoService.listarSesiones(req.usuario.id);
    res.json(sesiones);
  } catch (error) {
    next(error);
  }
}
