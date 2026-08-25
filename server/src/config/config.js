// config.js -> junta todas las variables de entorno en un solo lugar,
// así no ando con process.env desparramado por todo el código.

// dotenv/config lee el .env y lo mete en process.env apenas se importa,
// por eso va primero: cuando armamos config ya está todo cargado.
import 'dotenv/config';

// Cada valor trae un default para desarrollo, para que arranque aunque falte algo.
export const config = {
  // puerto del server (a número)
  puerto: Number(process.env.PORT) || 4000,

  // entorno actual, para prender/apagar cosas según dev o prod
  entorno: process.env.NODE_ENV || 'development',

  // conexión a la BD. La usa Prisma vía schema; acá la dejo por comodidad
  databaseUrl: process.env.DATABASE_URL,

  // JWT para firmar los tokens de sesión
  jwt: {
    secreto: process.env.JWT_SECRET || 'secreto_de_desarrollo_inseguro',
    // duración normal de la sesión
    expiraEn: process.env.JWT_EXPIRES_IN || '1d',
    // duración cuando se marca "mantener sesión iniciada" (pensado para el
    // dispositivo de casa del adulto mayor, así no re-loguea cada día)
    expiraEnLargo: process.env.JWT_EXPIRES_IN_LARGO || '30d',
  },

  // origen que deja pasar CORS (la url del front)
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8099',
};
