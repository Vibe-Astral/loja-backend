-- CreateEnum
CREATE TYPE "public"."TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'TRANSFERENCIA');

-- DropForeignKey
ALTER TABLE "public"."Estoque" DROP CONSTRAINT "Estoque_filialId_fkey";

-- AlterTable
ALTER TABLE "public"."Estoque" ADD COLUMN     "tecnicoId" TEXT,
ALTER COLUMN "filialId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produtoId" TEXT NOT NULL,
    "origemFilialId" TEXT,
    "destinoFilialId" TEXT,
    "origemTecnicoId" TEXT,
    "destinoTecnicoId" TEXT,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Estoque" ADD CONSTRAINT "Estoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "public"."Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estoque" ADD CONSTRAINT "Estoque_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_origemFilialId_fkey" FOREIGN KEY ("origemFilialId") REFERENCES "public"."Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_destinoFilialId_fkey" FOREIGN KEY ("destinoFilialId") REFERENCES "public"."Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_origemTecnicoId_fkey" FOREIGN KEY ("origemTecnicoId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_destinoTecnicoId_fkey" FOREIGN KEY ("destinoTecnicoId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
