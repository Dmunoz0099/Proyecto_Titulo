// evento.controller.js -> controladores de la Agenda (EventoAgenda).
// Mismo estilo que medicamentos: leen de req, llaman al service y responden;
// los errores van a next().

import * as eventoService from '../services/evento.service.js';

// GET /api/agenda
export async function listar(req, res, next) {
  try {
    const eventos = await eventoService.listar(req.usuario.id);
    res.json(eventos);
  } catch (error) {
    next(error);
  }
}

// POST /api/agenda (solo CUIDADOR)
export async function crear(req, res, next) {
  try {
    const evento = await eventoService.crear(req.usuario.id, req.body);
    res.status(201).json(evento);
  } catch (error) {
    next(error);
  }
}

// PUT /api/agenda/:id (solo CUIDADOR)
export async function actualizar(req, res, next) {
  try {
    const evento = await eventoService.actualizar(
      req.usuario.id,
      req.params.id,
      req.body
    );
    res.json(evento);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/agenda/:id (solo CUIDADOR)
export async function eliminar(req, res, next) {
  try {
    await eventoService.eliminar(req.usuario.id, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
