/*
  Warnings:

  - A unique constraint covering the columns `[produtoId,tecnicoId]` on the table `Estoque` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Estoque_produtoId_tecnicoId_key" ON "public"."Estoque"("produtoId", "tecnicoId");
