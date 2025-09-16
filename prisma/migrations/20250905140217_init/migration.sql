/*
  Warnings:

  - A unique constraint covering the columns `[produtoId,tecnicoId,filialId]` on the table `Estoque` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Estoque_produtoId_tecnicoId_key";

-- AlterTable
ALTER TABLE "public"."Produto" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "descricao" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Estoque_produtoId_tecnicoId_filialId_key" ON "public"."Estoque"("produtoId", "tecnicoId", "filialId");
