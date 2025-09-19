// src/estoque/estoque.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstoqueService {
  constructor(private prisma: PrismaService) {}

  // Lista cada "posição" de estoque (produto x local), com joins
  async listarPosicoes() {
    return this.prisma.estoque.findMany({
      include: {
        produto: true,
        filial: true,
        tecnico: { select: { id: true, email: true, role: true } },
      },
      orderBy: [{ produtoId: 'asc' }],
    });
  }

  // Saldo consolidado (soma) por produto
  async saldoProduto(produtoId: string) {
    const agg = await this.prisma.estoque.groupBy({
      by: ['produtoId'],
      where: { produtoId },
      _sum: { quantidade: true },
    });
    return { produtoId, quantidade: agg[0]?._sum.quantidade ?? 0 };
  }

  // Saldo geral por produto
  async saldoGeralPorProduto() {
    const agg = await this.prisma.estoque.groupBy({
      by: ['produtoId'],
      _sum: { quantidade: true },
    });

    const ids = agg.map((a) => a.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: ids } },
    });
    const produtosMap = new Map(produtos.map((p) => [p.id, p]));

    return agg.map((a) => ({
      produto: produtosMap.get(a.produtoId),
      quantidade: a._sum.quantidade ?? 0,
    }));
  }

  async listarTodos() {
    return this.prisma.estoque.findMany({
      include: { produto: true, filial: true, tecnico: true },
    });
  }

  async listarPorFilial(filialId: string) {
    return this.prisma.estoque.findMany({
      where: { filialId },
      include: { produto: true, filial: true },
    });
  }

  async listarPorTecnico(tecnicoId: string) {
    return this.prisma.estoque.findMany({
      where: { tecnicoId },
      include: {
        produto: true,
        tecnico: { select: { id: true, email: true } },
      },
    });
  }

  async obterEstoqueProdutoEmFilial(produtoId: string, filialId: string) {
    const pos = await this.prisma.estoque.findFirst({
      where: { produtoId, filialId },
      include: { produto: true, filial: true },
    });
    return pos ?? { produtoId, filialId, quantidade: 0 };
  }

  async obterEstoqueProdutoDeTecnico(produtoId: string, tecnicoId: string) {
    const pos = await this.prisma.estoque.findFirst({
      where: { produtoId, tecnicoId },
      include: {
        produto: true,
        tecnico: { select: { id: true, email: true } },
      },
    });
    return pos ?? { produtoId, tecnicoId, quantidade: 0 };
  }

  // 🔄 Transferência entre filiais
  async transferir(
    produtoId: string,
    origemFilialId: string,
    destinoFilialId: string,
    quantidade: number,
  ) {
    if (origemFilialId === destinoFilialId) {
      throw new BadRequestException(
        'A filial de origem e destino não podem ser a mesma.',
      );
    }
    if (quantidade <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const origem = await tx.estoque.findFirst({
        where: { produtoId, filialId: origemFilialId },
      });
      if (!origem || origem.quantidade < quantidade) {
        throw new BadRequestException(
          'Estoque insuficiente na filial de origem.',
        );
      }

      await tx.estoque.update({
        where: { id: origem.id },
        data: { quantidade: origem.quantidade - quantidade },
      });

      let destino = await tx.estoque.findFirst({
        where: { produtoId, filialId: destinoFilialId },
      });
      if (!destino) {
        destino = await tx.estoque.create({
          data: { produtoId, filialId: destinoFilialId, quantidade: 0 },
        });
      }
      await tx.estoque.update({
        where: { id: destino.id },
        data: { quantidade: destino.quantidade + quantidade },
      });

      // Movimentação
      await tx.movimentacaoEstoque.create({
        data: {
          tipo: 'TRANSFERENCIA',
          quantidade,
          produtoId,
          origemFilialId,
          destinoFilialId,
        },
      });

      return { message: 'Transferência realizada com sucesso!' };
    });
  }

  // 🔄 Transferência filial → técnico
  async transferirParaTecnico(
    produtoId: string,
    origemFilialId: string,
    destinoTecnicoId: string,
    quantidade: number,
  ) {
    if (quantidade <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const origem = await tx.estoque.findFirst({
        where: { produtoId, filialId: origemFilialId },
      });
      if (!origem || origem.quantidade < quantidade) {
        throw new BadRequestException(
          'Estoque insuficiente na filial de origem.',
        );
      }
      await tx.estoque.update({
        where: { id: origem.id },
        data: { quantidade: origem.quantidade - quantidade },
      });

      let destino = await tx.estoque.findFirst({
        where: { produtoId, tecnicoId: destinoTecnicoId },
      });
      if (!destino) {
        destino = await tx.estoque.create({
          data: { produtoId, tecnicoId: destinoTecnicoId, quantidade: 0 },
        });
      }
      await tx.estoque.update({
        where: { id: destino.id },
        data: { quantidade: destino.quantidade + quantidade },
      });

      // Movimentação
      await tx.movimentacaoEstoque.create({
        data: {
          tipo: 'TRANSFERENCIA',
          quantidade,
          produtoId,
          origemFilialId,
          destinoTecnicoId,
        },
      });

      return { message: 'Transferência para técnico realizada com sucesso!' };
    });
  }

  // 🔄 Devolução técnico → filial
  async transferirDoTecnicoParaFilial(
    produtoId: string,
    tecnicoId: string,
    quantidade: number,
    filialId: string,
  ) {
    if (quantidade <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const origem = await tx.estoque.findFirst({
        where: { produtoId, tecnicoId },
      });
      if (!origem || origem.quantidade < quantidade) {
        throw new BadRequestException('Estoque insuficiente no técnico.');
      }
      await tx.estoque.update({
        where: { id: origem.id },
        data: { quantidade: origem.quantidade - quantidade },
      });

      let destino = await tx.estoque.findFirst({
        where: { produtoId, filialId },
      });
      if (!destino) {
        destino = await tx.estoque.create({
          data: { produtoId, filialId, quantidade: 0 },
        });
      }
      await tx.estoque.update({
        where: { id: destino.id },
        data: { quantidade: destino.quantidade + quantidade },
      });

      // Movimentação
      await tx.movimentacaoEstoque.create({
        data: {
          tipo: 'DEVOLUCAO',
          quantidade,
          produtoId,
          origemTecnicoId: tecnicoId,
          destinoFilialId: filialId,
        },
      });

      return { message: 'Devolução concluída com sucesso!' };
    });
  }
}
