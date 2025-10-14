-- AlterTable
ALTER TABLE "public"."OrdemServico" ADD COLUMN     "clienteNome" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;
