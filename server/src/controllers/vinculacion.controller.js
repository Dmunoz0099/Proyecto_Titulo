// vinculacion.controller.js -> controladores para vincular la cuenta a un adulto
// mayor. Como siempre: sacan lo que necesitan de req, llaman al service y
// responden; los errores van a next().

import * as vinculacionService from '../services/vinculacion.service.js';

// GET /api/vinculacion/estado
export async function estado(req, res, next) {
  try {
    const info = await vinculacionService.estado(req.usuario);
    res.json(info);
  } catch (error) {
    next(error);
  }
}

// POST /api/vinculacion/paciente (solo CUIDADOR)
export async function crearPaciente(req, res, next) {
  try {
    const resultado = await vinculacionService.crearPaciente(req.usuario, req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
}

// POST /api/vinculacion/unir (cualquier rol con sesión)
export async function unir(req, res, next) {
  try {
    const resultado = await vinculacionService.unir(req.usuario, req.body);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

// POST /api/vinculacion/cuenta-paciente (solo CUIDADOR)
export async function crearCuentaPaciente(req, res, next) {
  try {
    const resultado = await vinculacionService.crearCuentaPaciente(
      req.usuario,
      req.body
    );
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
}

// POST /api/vinculacion/pin-paciente (solo CUIDADOR)
export async function cambiarPinPaciente(req, res, next) {
  try {
    const resultado = await vinculacionService.cambiarPinPaciente(
      req.usuario,
      req.body
    );
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
