// evento-calendario.controller.js -> controladores del Calendario a largo plazo
// (EventoCalendario). Mismo estilo que agenda: leen de req, llaman al service y
// responden; los errores van a next().

import * as calendarioService from '../services/evento-calendario.service.js';

// GET /api/calendario
export async function listar(req, res, next) {
  try {
    const eventos = await calendarioService.listar(req.usuario);
    res.json(eventos);
  } catch (error) {
    next(error);
  }
}

// POST /api/calendario (solo CUIDADOR)
export async function crear(req, res, next) {
  try {
    const evento = await calendarioService.crear(req.usuario, req.body);
    res.status(201).json(evento);
  } catch (error) {
    next(error);
  }
}

// PUT /api/calendario/:id (solo CUIDADOR)
export async function actualizar(req, res, next) {
  try {
    const evento = await calendarioService.actualizar(
      req.usuario,
      req.params.id,
      req.body
    );
    res.json(evento);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/calendario/:id (solo CUIDADOR)
export async function eliminar(req, res, next) {
  try {
    await calendarioService.eliminar(req.usuario, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
