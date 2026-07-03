// index.js -> router principal. Junta todos los routers y los monta bajo /api.
// Cuando sumo un módulo nuevo, lo engancho acá.

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import medicamentoRoutes from './medicamento.routes.js';
import eventoRoutes from './evento.routes.js';
import alertaRoutes from './alerta.routes.js';
import juegoRoutes from './juego.routes.js';

const router = Router();

// auth -> /api/auth/...
router.use('/auth', authRoutes);

// medicamentos -> /api/medicamentos/...
router.use('/medicamentos', medicamentoRoutes);

// agenda -> /api/agenda/...
router.use('/agenda', eventoRoutes);

// alertas SOS -> /api/alertas/...
router.use('/alertas', alertaRoutes);

// juegos -> /api/juegos/...
router.use('/juegos', juegoRoutes);

export default router;
