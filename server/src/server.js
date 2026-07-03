// server.js -> punto de entrada del backend.
// Solo hace dos cosas: conectar a la BD y poner la app a escuchar.

import app from './app.js';
import { config } from './config/config.js';
import { prisma } from './config/prisma.js';

// async porque conectar a la BD devuelve una promesa (puede tardar o fallar)
async function iniciarServidor() {
  try {
    // abre la conexión con Supabase. Si la DATABASE_URL está mal, revienta acá.
    await prisma.$connect();
    console.log('✅ Conexión establecida con la base de datos (Supabase/PostgreSQL)');

    // ya con la BD ok, abrimos el puerto
    app.listen(config.puerto, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.puerto}`);
      console.log(`   Prueba la salud en: http://localhost:${config.puerto}/api/health`);
    });
  } catch (error) {
    // si falla el arranque (casi siempre la BD), avisamos y cortamos con código 1
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
