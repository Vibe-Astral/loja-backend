import { PrismaClient, Role, TipoMovimentacao } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dados de estoque...');

  // 1) Usuário admin
  const adminPass = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      password: adminPass,
      role: Role.ADMIN,
    },
  });

  // 2) Técnico
  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@erp.com' },
    update: {},
    create: {
      email: 'tecnico@erp.com',
      password: await bcrypt.hash('123456', 10),
      role: Role.TECNICO,
    },
  });

  // 3) Filial
  const filial = await prisma.filial.create({
    data: { nome: 'Filial Principal' },
  });

  // 4) Produto
  const produto = await prisma.produto.create({
    data: {
      nome: 'Display iPhone 11',
      preco: 450.0,
      fornecedor: 'Fornecedor Oficial',
      categoria: 'Peças',
      descricao: 'Display original compatível com iPhone 11',
    },
  });

  // 5) Estoque inicial na filial (zerado)
  let estoqueFilial = await prisma.estoque.create({
    data: {
      produtoId: produto.id,
      filialId: filial.id,
      quantidade: 0,
    },
  });

  // 6) Movimentação de ENTRADA (10 unidades na filial)
  await prisma.$transaction(async (tx) => {
    // credita no estoque da filial
    estoqueFilial = await tx.estoque.update({
      where: { id: estoqueFilial.id },
      data: { quantidade: estoqueFilial.quantidade + 10 },
    });

    // cria histórico
    await tx.movimentacaoEstoque.create({
      data: {
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: 10,
        produtoId: produto.id,
        destinoFilialId: filial.id,
      },
    });
  });

  // 7) Movimentação de TRANSFERÊNCIA (3 unidades da filial → técnico)
  await prisma.$transaction(async (tx) => {
    // debita da filial
    await tx.estoque.update({
      where: { id: estoqueFilial.id },
      data: { quantidade: estoqueFilial.quantidade - 3 },
    });

    // cria/atualiza estoque do técnico
    let estoqueTecnico = await tx.estoque.findFirst({
      where: { produtoId: produto.id, tecnicoId: tecnico.id },
    });

    if (estoqueTecnico) {
      await tx.estoque.update({
        where: { id: estoqueTecnico.id },
        data: { quantidade: estoqueTecnico.quantidade + 3 },
      });
    } else {
      await tx.estoque.create({
        data: {
          produtoId: produto.id,
          tecnicoId: tecnico.id,
          quantidade: 3,
        },
      });
    }

    // histórico
    await tx.movimentacaoEstoque.create({
      data: {
        tipo: TipoMovimentacao.TRANSFERENCIA,
        quantidade: 3,
        produtoId: produto.id,
        origemFilialId: filial.id,
        destinoTecnicoId: tecnico.id,
      },
    });
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
