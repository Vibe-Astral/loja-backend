/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `OrdemServico` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `OrdemServico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OrdemServico" ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "descricao" TEXT;

-- CreateTable
CREATE TABLE "public"."OrdemServicoItem" (
    "id" TEXT NOT NULL,
    "ordemId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "OrdemServicoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdemServico_codigo_key" ON "public"."OrdemServico"("codigo");
