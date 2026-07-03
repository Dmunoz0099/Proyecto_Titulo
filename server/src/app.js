// app.js -> arma y configura la app de Express (no la levanta).
// La separo de server.js para poder reusarla en tests sin abrir un puerto real.

import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import rutas from './routes/index.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/manejarErrores.js';

const app = express();

// --- middlewares globales ---

// cors: dejar que el front (otro puerto) le pegue a la api
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// parsea los body en json y los deja en req.body
app.use(express.json());

// --- rutas ---

// health check para ver de un vistazo si el server está vivo
app.get('/api/health', (req, res) => {
  res.json({
    estado: 'ok',
    mensaje: 'El servidor está funcionando correctamente',
    entorno: config.entorno,
    timestamp: new Date().toISOString(),
  });
});

// todo cuelga de /api (auth, medicamentos, agenda, etc.)
app.use('/api', rutas);

// --- manejo de errores (siempre al final) ---

// lo que no matcheó ninguna ruta cae acá como 404
app.use(rutaNoEncontrada);

// manejador central: deja todos los errores en el mismo formato json. Va el último.
app.use(manejarErrores);

export default app;
