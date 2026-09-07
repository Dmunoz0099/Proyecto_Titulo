// delete-demo-luis.js -> borra la familia demo "Luis Zapata" (paciente + cuidadora
// + familiar) junto con el AdultoMayor que comparten y todos sus datos.
// Es un one-shot para limpiar data de prueba; todo va en una transacción.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// El pooler (pgBouncer, 6543) rompe las transacciones interactivas de Prisma.
// Para este mantenimiento uso la conexión DIRECTA (5432), que sí las soporta.
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
  log: ['warn', 'error'],
});

// IDs objetivo (confirmados a mano antes de correr esto).
const USUARIOS_A_BORRAR = [
  '12de4fe0-1eb8-4346-a945-cb3ffc3f3550', // luis  (PACIENTE)
  '9c70c998-0416-4975-8065-f87fed528c64', // milena (CUIDADOR)
  '57a31b51-f769-415c-9e8f-f864703e48aa', // diego  (FAMILIAR)
];
const NOMBRE_ADULTO = 'Luis Zapata'; // exacto, para no pescar "Luis Reinaldo Zapata"
const CUENTA_PROTEGIDA = '870bfa32-7b5a-4681-8a4a-660877854217'; // dmz (Diego Muñoz) — NO tocar

// Salvaguarda dura: si por error la cuenta propia quedó en la lista, aborta.
if (USUARIOS_A_BORRAR.includes(CUENTA_PROTEGIDA)) {
  console.error('ABORT: la cuenta protegida está en la lista de borrado.');
  process.exit(1);
}

async function main() {
  const adulto = await prisma.adultoMayor.findFirst({ where: { nombre: NOMBRE_ADULTO } });
  if (!adulto) {
    console.error(`No se encontró un AdultoMayor con nombre exacto "${NOMBRE_ADULTO}".`);
    process.exit(1);
  }
  const amId = adulto.id;
  const uids = USUARIOS_A_BORRAR;

  // Guarda previa: el adulto no debe tener vinculado ningún usuario fuera de
  // los 3 objetivo (así jamás rompo otra cuenta, como la tuya).
  const otros = await prisma.usuario.count({
    where: { adultoMayorId: amId, id: { notIn: uids } },
  });
  if (otros > 0) {
    throw new Error(`El AdultoMayor tiene ${otros} usuario(s) fuera de la lista; aborto.`);
  }

  const meds = await prisma.medicamento.findMany({
    where: { adultoMayorId: amId },
    select: { id: true },
  });
  const medIds = meds.map((m) => m.id);

  // Transacción por lote (un solo viaje): hijos primero, padres al final.
  const [alertas, sesiones, bitacoras, familiares, eventos, registros, medicamentosDel, usuariosDel, adultoDel] =
    await prisma.$transaction([
      prisma.alertaSos.deleteMany({
        where: {
          OR: [{ adultoMayorId: amId }, { creadaPorId: { in: uids } }, { atendidaPorId: { in: uids } }],
        },
      }),
      prisma.sesionJuego.deleteMany({ where: { adultoMayorId: amId } }),
      prisma.entradaBitacora.deleteMany({
        where: { OR: [{ adultoMayorId: amId }, { autorId: { in: uids } }] },
      }),
      prisma.familiar.deleteMany({ where: { adultoMayorId: amId } }),
      prisma.eventoAgenda.deleteMany({ where: { adultoMayorId: amId } }),
      prisma.registroMedicamento.deleteMany({
        where: { OR: [{ medicamentoId: { in: medIds } }, { registradoPorId: { in: uids } }] },
      }),
      prisma.medicamento.deleteMany({ where: { adultoMayorId: amId } }),
      prisma.usuario.deleteMany({ where: { id: { in: uids } } }),
      prisma.adultoMayor.delete({ where: { id: amId } }),
    ]);

  const resumen = {
    alertas: alertas.count,
    sesiones: sesiones.count,
    bitacoras: bitacoras.count,
    familiares: familiares.count,
    eventos: eventos.count,
    registros: registros.count,
    medicamentos: medicamentosDel.count,
    usuarios: usuariosDel.count,
    adultoMayor: adultoDel.nombre,
  };

  console.log('✅ Borrado completado en transacción:');
  console.log(`   Usuarios eliminados      : ${resumen.usuarios}`);
  console.log(`   AdultoMayor eliminado    : ${resumen.adultoMayor}`);
  console.log(`   Alertas SOS              : ${resumen.alertas}`);
  console.log(`   Sesiones de juego        : ${resumen.sesiones}`);
  console.log(`   Bitácoras                : ${resumen.bitacoras}`);
  console.log(`   Familiares               : ${resumen.familiares}`);
  console.log(`   Eventos de agenda        : ${resumen.eventos}`);
  console.log(`   Registros de medicamento : ${resumen.registros}`);
  console.log(`   Medicamentos             : ${resumen.medicamentos}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('❌ Error (no se aplicó ningún cambio):', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
