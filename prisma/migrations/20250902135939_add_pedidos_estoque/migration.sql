-- CreateEnum
CREATE TYPE "public"."StatusPedido" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'ESTOQUISTA';

-- CreateTable
CREATE TABLE "public"."PedidoEstoque" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "status" "public"."StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produtoId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,

    CONSTRAINT "PedidoEstoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PedidoEstoque" ADD CONSTRAINT "PedidoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PedidoEstoque" ADD CONSTRAINT "PedidoEstoque_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
