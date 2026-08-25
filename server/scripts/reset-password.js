// reset-password.js -> resetea la contraseña de un usuario.
// Las claves se guardan hasheadas (bcrypt), así que la original NO se puede
// recuperar; esto solo la reemplaza por una nueva.
//
// Uso (dentro de server/):
//   node scripts/reset-password.js <nombreUsuario> <nuevaClave>
// Ejemplo:
//   node scripts/reset-password.js eliana 1234

// dotenv primero para que DATABASE_URL esté cargada antes de tocar Prisma
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const [, , nombreUsuario, nuevaClave] = process.argv;

if (!nombreUsuario || !nuevaClave) {
  console.error('Uso: node scripts/reset-password.js <nombreUsuario> <nuevaClave>');
  process.exit(1);
}

async function main() {
  const usuario = await prisma.usuario.findUnique({ where: { nombreUsuario } });
  if (!usuario) {
    console.error(`❌ No existe un usuario con nombre "${nombreUsuario}".`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(nuevaClave, 10);
  await prisma.usuario.update({
    where: { nombreUsuario },
    data: { password: hash },
  });

  console.log(`✅ Clave actualizada para "${nombreUsuario}" (${usuario.rol}).`);
  console.log(`   Ahora inicia sesión con: usuario ${nombreUsuario} / clave ${nuevaClave}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
