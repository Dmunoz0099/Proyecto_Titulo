// medicamento.controller.js -> controladores de medicamentos.
// Igual que en auth: leen de req, llaman al service y responden. Nada de lógica
// de negocio acá (va en el service) y los errores se delegan a next().

import * as medicamentoService from '../services/medicamento.service.js';

// GET /api/medicamentos
export async function listar(req, res, next) {
  try {
    const medicamentos = await medicamentoService.listarActivos(req.usuario.id);
    res.json(medicamentos);
  } catch (error) {
    next(error);
  }
}

// POST /api/medicamentos (solo CUIDADOR)
export async function crear(req, res, next) {
  try {
    const medicamento = await medicamentoService.crear(req.usuario.id, req.body);
    res.status(201).json(medicamento);
  } catch (error) {
    next(error);
  }
}

// PUT /api/medicamentos/:id (solo CUIDADOR)
export async function actualizar(req, res, next) {
  try {
    const medicamento = await medicamentoService.actualizar(
      req.usuario.id,
      req.params.id,
      req.body
    );
    res.json(medicamento);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/medicamentos/:id (solo CUIDADOR) -> borrado lógico
export async function eliminar(req, res, next) {
  try {
    await medicamentoService.eliminar(req.usuario.id, req.params.id);
    res.status(204).end(); // 204 = ok pero sin cuerpo que devolver
  } catch (error) {
    next(error);
  }
}

// POST /api/medicamentos/:id/tomas
export async function registrarToma(req, res, next) {
  try {
    const toma = await medicamentoService.registrarToma(
      req.usuario.id,
      req.params.id,
      req.body
    );
    res.status(201).json(toma);
  } catch (error) {
    next(error);
  }
}

// GET /api/medicamentos/:id/tomas
export async function historial(req, res, next) {
  try {
    const tomas = await medicamentoService.historial(
      req.usuario.id,
      req.params.id
    );
    res.json(tomas);
  } catch (error) {
    next(error);
  }
}

// GET /api/medicamentos/tomas -> todas las tomas del adulto mayor
export async function listarTomas(req, res, next) {
  try {
    const tomas = await medicamentoService.listarTomas(req.usuario.id);
    res.json(tomas);
  } catch (error) {
    next(error);
  }
}
