-- AlterTable
ALTER TABLE "public"."Venda" ADD COLUMN     "clienteNome" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;
