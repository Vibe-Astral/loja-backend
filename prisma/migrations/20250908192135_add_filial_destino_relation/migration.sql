-- AlterTable
ALTER TABLE "public"."PedidoEstoque" ADD COLUMN     "filialDestinoId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."PedidoEstoque" ADD CONSTRAINT "PedidoEstoque_filialDestinoId_fkey" FOREIGN KEY ("filialDestinoId") REFERENCES "public"."Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
