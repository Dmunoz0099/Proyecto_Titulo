// prisma.js -> un único cliente de Prisma para toda la app (singleton).
// Cada new PrismaClient() abre su propio pool; si lo creara en cada archivo
// me quedaría sin conexiones. Por eso reuso siempre el mismo.

import { PrismaClient } from '@prisma/client';

// En dev, nodemon recarga el código todo el rato. Guardo la instancia en global
// para reaprovecharla entre recargas y no ir creando clientes nuevos.
const globalParaPrisma = globalThis;

// si ya hay una en global la uso, si no creo una
export const prisma =
  globalParaPrisma.prisma ||
  new PrismaClient({
    // qué loguea prisma. En dev dejo warnings y errores para debuggear
    log: ['warn', 'error'],
  });

// solo dejo la referencia global fuera de producción
if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prisma = prisma;
}
