// seed.js -> llena la BD con datos de prueba para desarrollo: un adulto mayor,
// sus usuarios (cuidador, familiar y paciente), un par de medicamentos, la agenda
// del día, una alerta y unas sesiones de juego.
// Se corre con: pnpm seed
// Es idempotente: primero borra lo que hay (en el orden que piden las FKs) y
// después lo vuelve a crear, así lo puedo correr las veces que quiera sin duplicar.

import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

// contraseña común para los usuarios de prueba (acá en texto plano, pero se
// guarda hasheada). Cómodo para probar el login.
const PASSWORD_DEMO = '123456';

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1) limpieza: borro en orden inverso a las dependencias (primero las tablas
  //    "hijas" que apuntan a otras)
  await prisma.alertaSos.deleteMany();
  await prisma.registroMedicamento.deleteMany();
  await prisma.sesionJuego.deleteMany();
  await prisma.eventoAgenda.deleteMany();
  await prisma.familiar.deleteMany();
  await prisma.entradaBitacora.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.adultoMayor.deleteMany();
  console.log('🧹 Datos anteriores eliminados.');

  // 2) el adulto mayor
  const adultoMayor = await prisma.adultoMayor.create({
    data: {
      nombre: 'Luis Zapata',
      fechaNacimiento: new Date('1945-03-12'),
      notas: 'Diagnóstico de deterioro cognitivo leve. Usa lentes.',
    },
  });
  console.log(`👵 Adulto mayor creado: ${adultoMayor.nombre}`);

  // 3) usuarios (cuidador y familiar), los dos ligados al adulto.
  //    Hasheo la contraseña antes de guardar.
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);

  const cuidador = await prisma.usuario.create({
    data: {
      nombre: 'Milena Cuidadora',
      nombreUsuario: 'milena',
      email: 'milena@demo.cl',
      password: passwordHash,
      rol: 'CUIDADOR',
      adultoMayorId: adultoMayor.id,
    },
  });

  const familiar = await prisma.usuario.create({
    data: {
      nombre: 'Diego Familiar',
      nombreUsuario: 'diego',
      email: 'diego@demo.cl',
      password: passwordHash,
      rol: 'FAMILIAR',
      adultoMayorId: adultoMayor.id,
    },
  });
  console.log(
    `🧑‍⚕️ Usuarios creados: ${cuidador.nombreUsuario}, ${familiar.nombreUsuario}`
  );

  // usuario PACIENTE de ejemplo: el adulto mayor que entra con un nombre de
  // usuario simple y SIN email (el caso típico de la idea)
  const paciente = await prisma.usuario.create({
    data: {
      nombre: 'Luis Zapata',
      nombreUsuario: 'luis',
      password: passwordHash,
      rol: 'PACIENTE',
      adultoMayorId: adultoMayor.id,
    },
  });
  console.log(`👵 Usuario paciente creado: ${paciente.nombreUsuario} (sin email)`);

  // 4) medicamentos
  await prisma.medicamento.createMany({
    data: [
      {
        nombre: 'Donepecilo',
        dosis: '5 mg',
        horario: '08:00',
        observaciones: 'Tomar con el desayuno.',
        adultoMayorId: adultoMayor.id,
      },
      {
        nombre: 'Losartán',
        dosis: '50 mg',
        horario: '21:00',
        observaciones: 'Para la presión arterial.',
        adultoMayorId: adultoMayor.id,
      },
    ],
  });
  console.log('💊 2 medicamentos creados.');

  // 5) eventos de agenda. Es una rutina DIARIA: solo importa la hora del día.
  //    Para que el orden y la vista queden estables sin importar la zona horaria,
  //    guardo la hora sobre una fecha fija en UTC (1970-01-01), igual que el
  //    service de agenda. El "icono" es una clave que el front convierte en
  //    imagen (ver components/ui/Icon.jsx).
  const horaUTC = (horaTexto) => new Date(`1970-01-01T${horaTexto}:00.000Z`);

  await prisma.eventoAgenda.createMany({
    data: [
      {
        titulo: 'Desayuno',
        descripcion: 'Avena con frutas y un vaso de agua.',
        hora: horaUTC('08:00'),
        icono: 'cup',
        adultoMayorId: adultoMayor.id,
      },
      {
        titulo: 'Medicación de la mañana',
        descripcion: 'Tomar con el desayuno.',
        hora: horaUTC('09:00'),
        icono: 'pill',
        adultoMayorId: adultoMayor.id,
      },
      {
        titulo: 'Caminata',
        descripcion: 'Paseo suave de 20 minutos por el parque.',
        hora: horaUTC('11:00'),
        icono: 'walk',
        adultoMayorId: adultoMayor.id,
      },
      {
        titulo: 'Almuerzo',
        descripcion: 'En familia.',
        hora: horaUTC('14:00'),
        icono: 'plate',
        adultoMayorId: adultoMayor.id,
      },
      {
        titulo: 'Llamada con la familia',
        descripcion: 'Videollamada con los nietos.',
        hora: horaUTC('18:30'),
        icono: 'phone',
        adultoMayorId: adultoMayor.id,
      },
    ],
  });
  console.log('📅 5 eventos de agenda creados.');

  // 6) una alerta SOS de ejemplo (pendiente), generada por el PACIENTE.
  //    Así se ve al toque el panel de alertas en el inicio del cuidador/familiar.
  await prisma.alertaSos.create({
    data: {
      mensaje: 'Necesito ayuda',
      adultoMayorId: adultoMayor.id,
      creadaPorId: paciente.id,
    },
  });
  console.log('🆘 1 alerta SOS de ejemplo creada (pendiente).');

  // 7) sesiones de juego de ejemplo (Memorice), repartidas en días pasados,
  //    para que el "Seguimiento" ya muestre progreso de entrada
  const haceDias = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };
  await prisma.sesionJuego.createMany({
    data: [
      { fecha: haceDias(5), puntaje: 440, aciertos: 6, errores: 4, duracionSegundos: 95, adultoMayorId: adultoMayor.id },
      { fecha: haceDias(3), puntaje: 500, aciertos: 6, errores: 2, duracionSegundos: 78, adultoMayorId: adultoMayor.id },
      { fecha: haceDias(1), puntaje: 560, aciertos: 6, errores: 1, duracionSegundos: 64, adultoMayorId: adultoMayor.id },
    ],
  });
  console.log('🧩 3 sesiones de juego de ejemplo creadas.');

  console.log('\n✅ Seed completado con éxito.');
  console.log('   Usuarios de prueba (contraseña: 123456):');
  console.log('   - CUIDADOR -> usuario: cuidador');
  console.log('   - FAMILIAR -> usuario: familiar');
  console.log('   - PACIENTE -> usuario: rosa (sin email)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Error en el seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
