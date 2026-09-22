-- Suma el tipo de juego a las sesiones (para distinguir Memorice de la sopa de
-- letras en el seguimiento). El default PALABRAS deja las sesiones existentes
-- asignadas al primer juego sin tener que tocarlas.

-- CreateEnum
CREATE TYPE "TipoJuego" AS ENUM ('PALABRAS', 'SOPA_LETRAS');

-- AlterTable
ALTER TABLE "SesionJuego" ADD COLUMN     "tipoJuego" "TipoJuego" NOT NULL DEFAULT 'PALABRAS';

-- CreateIndex
CREATE INDEX "SesionJuego_adultoMayorId_tipoJuego_idx" ON "SesionJuego"("adultoMayorId", "tipoJuego");
