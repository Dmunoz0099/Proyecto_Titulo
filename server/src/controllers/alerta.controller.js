// alerta.controller.js -> controladores de las alertas SOS.
// Sin lógica de negocio (va en el service): leen de req, llaman al service y
// responden, mandando los errores a next().

import * as alertaService from '../services/alerta.service.js';

// POST /api/alertas (solo PACIENTE)
export async function crear(req, res, next) {
  try {
    const alerta = await alertaService.crear(req.usuario.id, req.body);
    res.status(201).json(alerta);
  } catch (error) {
    next(error);
  }
}

// GET /api/alertas (solo CUIDADOR / FAMILIAR)
export async function listar(req, res, next) {
  try {
    const alertas = await alertaService.listar(req.usuario.id);
    res.json(alertas);
  } catch (error) {
    next(error);
  }
}

// POST /api/alertas/:id/atender (solo CUIDADOR / FAMILIAR)
export async function atender(req, res, next) {
  try {
    const alerta = await alertaService.atender(req.usuario.id, req.params.id);
    res.json(alerta);
  } catch (error) {
    next(error);
  }
}
