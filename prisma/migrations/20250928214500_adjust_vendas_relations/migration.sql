/*
  Warnings:

  - You are about to drop the column `cliente` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Venda" DROP COLUMN "cliente",
ADD COLUMN     "clienteId" TEXT NOT NULL;
