// find-usuario.js -> busca usuarios por nombre (solo lectura, no borra nada).
//   node scripts/find-usuario.js "luis zapata"
import 'dotenv/config';
import { prisma } from '../src/config/prisma.js';

const termino = process.argv.slice(2).join(' ').trim();
if (!termino) {
  console.error('Uso: node scripts/find-usuario.js "<nombre a buscar>"');
  process.exit(1);
}

async function main() {
  const usuarios = await prisma.usuario.findMany({
    where: { nombre: { contains: termino, mode: 'insensitive' } },
    include: {
      adultoMayor: { select: { nombre: true } },
      _count: {
        select: {
          registros: true,
          bitacoras: true,
          alertasCreadas: true,
          alertasAtendidas: true,
        },
      },
    },
  });

  if (usuarios.length === 0) {
    console.log(`No se encontró ningún usuario cuyo nombre contenga "${termino}".`);
    return;
  }

  console.log(`Se encontraron ${usuarios.length} usuario(s):\n`);
  for (const u of usuarios) {
    console.log(`• ${u.nombre}  (usuario: ${u.nombreUsuario} | rol: ${u.rol})`);
    console.log(`  id: ${u.id}`);
    console.log(`  email: ${u.email ?? '—'}`);
    console.log(`  adultoMayor vinculado: ${u.adultoMayor?.nombre ?? '—'}`);
    console.log(`  registros medicamento: ${u._count.registros} | bitácoras: ${u._count.bitacoras}`);
    console.log(`  SOS creadas: ${u._count.alertasCreadas} | SOS atendidas: ${u._count.alertasAtendidas}`);
    console.log('');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
