-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CONSULTOR', 'TECNICO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'FECHADA');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Filial" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "fornecedor" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Estoque" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "produtoId" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrdemServico" (
    "id" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tecnicoId" TEXT,

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Estoque" ADD CONSTRAINT "Estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estoque" ADD CONSTRAINT "Estoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "public"."Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdemServico" ADD CONSTRAINT "OrdemServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdemServico" ADD CONSTRAINT "OrdemServico_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
