-- DropForeignKey
ALTER TABLE "public"."Estoque" DROP CONSTRAINT "Estoque_filialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Estoque" DROP CONSTRAINT "Estoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Estoque" DROP CONSTRAINT "Estoque_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_destinoFilialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_destinoTecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_origemFilialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_origemTecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovimentacaoEstoque" DROP CONSTRAINT "MovimentacaoEstoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemServico" DROP CONSTRAINT "OrdemServico_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PedidoEstoque" DROP CONSTRAINT "PedidoEstoque_filialDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PedidoEstoque" DROP CONSTRAINT "PedidoEstoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PedidoEstoque" DROP CONSTRAINT "PedidoEstoque_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_filialId_fkey";

-- CreateTable
CREATE TABLE "public"."Venda" (
    "id" TEXT NOT NULL,
    "consultorId" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendaItem" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VendaItem_pkey" PRIMARY KEY ("id")
);
