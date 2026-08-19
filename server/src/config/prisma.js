// prisma.js -> un único cliente de Prisma para toda la app (singleton).
// Cada new PrismaClient() abre su propio pool; si lo creara en cada archivo
// me quedaría sin conexiones. Por eso reuso siempre el mismo.

import { PrismaClient } from '@prisma/client';

// En dev, nodemon recarga el código todo el rato. En serverless (Vercel), una
// misma función "caliente" atiende varios requests reusando el módulo. En ambos
// casos guardo la instancia en global para reaprovecharla y no ir abriendo
// clientes (y pools de conexión) nuevos contra Supabase.
const globalParaPrisma = globalThis;

// si ya hay una en global la uso, si no creo una
export const prisma =
  globalParaPrisma.prisma ||
  new PrismaClient({
    // qué loguea prisma. En dev dejo warnings y errores para debuggear
    log: ['warn', 'error'],
  });

// la dejo en global siempre: en dev sobrevive a las recargas de nodemon y en
// prod la comparten las invocaciones calientes de la misma función serverless.
globalParaPrisma.prisma = prisma;
