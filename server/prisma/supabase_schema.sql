-- ============================================================
--  supabase_schema.sql
--  Arquitectura de la base de datos en SQL de PostgreSQL,
--  lista para ejecutarse en el "SQL Editor" de Supabase.
--
--  Refleja EXACTAMENTE las mismas tablas y relaciones que
--  el archivo prisma/schema.prisma.
--
--  Convenciones:
--   - Identificadores entre comillas dobles ("Usuario") para
--     conservar la misma capitalización (PascalCase) que Prisma.
--   - PK de tipo uuid con valor por defecto gen_random_uuid().
--   - Marcas de tiempo con zona horaria (timestamptz).
--   - Acciones de FK que imitan los valores por defecto de Prisma:
--       * Relación obligatoria  -> ON DELETE RESTRICT
--       * Relación opcional      -> ON DELETE SET NULL
--       * En ambos casos         -> ON UPDATE CASCADE
-- ============================================================

-- gen_random_uuid() está disponible en PostgreSQL 13+ (y en Supabase).
-- Si tu instancia lo pidiera, podrías habilitar la extensión:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
--  TIPOS ENUMERADOS (deben crearse antes que las tablas)
-- ------------------------------------------------------------
CREATE TYPE "Rol" AS ENUM ('PACIENTE', 'CUIDADOR', 'FAMILIAR');
CREATE TYPE "EstadoAnimo" AS ENUM ('BIEN', 'NEUTRAL', 'MAL');

-- ------------------------------------------------------------
--  TABLA: AdultoMayor  (se crea primero porque otras la referencian)
-- ------------------------------------------------------------
CREATE TABLE "AdultoMayor" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre"          text        NOT NULL,
  "fechaNacimiento" timestamptz,
  "notas"           text,
  "creadoEn"        timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  TABLA: Usuario
-- ------------------------------------------------------------
CREATE TABLE "Usuario" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre"        text        NOT NULL,
  -- Nombre de usuario para iniciar sesión (único y obligatorio).
  "nombreUsuario" text        NOT NULL UNIQUE,
  -- Email opcional (único cuando está presente; PostgreSQL admite
  -- múltiples NULL en una columna UNIQUE).
  "email"         text        UNIQUE,
  "password"      text        NOT NULL,
  "rol"           "Rol"       NOT NULL,
  "adultoMayorId" uuid,
  "creadoEn"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "Usuario_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: Medicamento
-- ------------------------------------------------------------
CREATE TABLE "Medicamento" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre"        text        NOT NULL,
  "dosis"         text        NOT NULL,
  "horario"       text        NOT NULL,
  "observaciones" text,
  "activo"        boolean     NOT NULL DEFAULT true,
  "adultoMayorId" uuid        NOT NULL,
  "creadoEn"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "Medicamento_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: RegistroMedicamento
-- ------------------------------------------------------------
CREATE TABLE "RegistroMedicamento" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "administrado"    boolean     NOT NULL,
  "fechaHora"       timestamptz NOT NULL,
  "comentario"      text,
  "medicamentoId"   uuid        NOT NULL,
  "registradoPorId" uuid,
  CONSTRAINT "RegistroMedicamento_medicamentoId_fkey"
    FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RegistroMedicamento_registradoPorId_fkey"
    FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: EventoAgenda
-- ------------------------------------------------------------
CREATE TABLE "EventoAgenda" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulo"        text        NOT NULL,
  "descripcion"   text,
  "hora"          timestamptz NOT NULL,
  "icono"         text,
  "adultoMayorId" uuid        NOT NULL,
  "creadoEn"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "EventoAgenda_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: Familiar
-- ------------------------------------------------------------
CREATE TABLE "Familiar" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre"        text        NOT NULL,
  "relacion"      text        NOT NULL,
  "fotoUrl"       text,
  "adultoMayorId" uuid        NOT NULL,
  "creadoEn"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "Familiar_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: EntradaBitacora
-- ------------------------------------------------------------
CREATE TABLE "EntradaBitacora" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fecha"         timestamptz   NOT NULL,
  "animo"         "EstadoAnimo" NOT NULL,
  "comidas"       text,
  "notas"         text,
  "adultoMayorId" uuid          NOT NULL,
  "autorId"       uuid,
  CONSTRAINT "EntradaBitacora_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "EntradaBitacora_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "Usuario"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: AlertaSos  (botón "Necesito ayuda" del PACIENTE)
-- ------------------------------------------------------------
CREATE TABLE "AlertaSos" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mensaje"       text,
  "atendida"      boolean     NOT NULL DEFAULT false,
  "atendidaEn"    timestamptz,
  "adultoMayorId" uuid        NOT NULL,
  "creadaPorId"   uuid,
  "atendidaPorId" uuid,
  "creadaEn"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "AlertaSos_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AlertaSos_creadaPorId_fkey"
    FOREIGN KEY ("creadaPorId") REFERENCES "Usuario"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AlertaSos_atendidaPorId_fkey"
    FOREIGN KEY ("atendidaPorId") REFERENCES "Usuario"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  TABLA: SesionJuego
-- ------------------------------------------------------------
CREATE TABLE "SesionJuego" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fecha"            timestamptz NOT NULL,
  "puntaje"          integer     NOT NULL,
  "aciertos"         integer     NOT NULL,
  "errores"          integer     NOT NULL,
  "duracionSegundos" integer     NOT NULL,
  "adultoMayorId"    uuid        NOT NULL,
  CONSTRAINT "SesionJuego_adultoMayorId_fkey"
    FOREIGN KEY ("adultoMayorId") REFERENCES "AdultoMayor"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ------------------------------------------------------------
--  ÍNDICES sobre claves foráneas (mejoran el rendimiento de los
--  JOINs y de los borrados en cascada/validación de FKs).
-- ------------------------------------------------------------
CREATE INDEX "Usuario_adultoMayorId_idx"             ON "Usuario" ("adultoMayorId");
CREATE INDEX "Medicamento_adultoMayorId_idx"         ON "Medicamento" ("adultoMayorId");
CREATE INDEX "RegistroMedicamento_medicamentoId_idx" ON "RegistroMedicamento" ("medicamentoId");
CREATE INDEX "RegistroMedicamento_registradoPorId_idx" ON "RegistroMedicamento" ("registradoPorId");
CREATE INDEX "EventoAgenda_adultoMayorId_idx"        ON "EventoAgenda" ("adultoMayorId");
CREATE INDEX "Familiar_adultoMayorId_idx"            ON "Familiar" ("adultoMayorId");
CREATE INDEX "EntradaBitacora_adultoMayorId_idx"     ON "EntradaBitacora" ("adultoMayorId");
CREATE INDEX "EntradaBitacora_autorId_idx"           ON "EntradaBitacora" ("autorId");
CREATE INDEX "SesionJuego_adultoMayorId_idx"         ON "SesionJuego" ("adultoMayorId");
CREATE INDEX "AlertaSos_adultoMayorId_idx"           ON "AlertaSos" ("adultoMayorId");
CREATE INDEX "AlertaSos_creadaPorId_idx"             ON "AlertaSos" ("creadaPorId");
CREATE INDEX "AlertaSos_atendidaPorId_idx"           ON "AlertaSos" ("atendidaPorId");
