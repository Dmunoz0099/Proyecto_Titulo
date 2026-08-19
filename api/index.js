// api/index.js -> punto de entrada serverless para Vercel.
// Vercel no deja un servidor con app.listen() corriendo: en su lugar invoca
// una función por request. Como app.js ya exporta la app de Express sin
// levantar el puerto, acá solo la re-exportamos y Vercel la usa como handler.
// El enrutado real (/api/health, /api/auth, etc.) lo sigue resolviendo Express.

import app from '../server/src/app.js';

export default app;
