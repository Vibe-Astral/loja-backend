import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  // 📊 Faturamento total por período
  async vendasPorPeriodo(inicio: Date, fim: Date) {
    return this.prisma.venda.groupBy({
      by: ['consultorId'],
      where: { createdAt: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
    });
  }

  // 📊 Vendas por filial
  async vendasPorFilial(inicio: Date, fim: Date) {
    return this.prisma.venda.groupBy({
      by: ['consultorId'],
      where: { createdAt: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
    });
  }

  // 📊 Produtos mais vendidos
  async produtosMaisVendidos(inicio: Date, fim: Date) {
    return this.prisma.vendaItem.groupBy({
      by: ['produtoId'],
      where: { venda: { createdAt: { gte: inicio, lte: fim } } },
      _sum: { quantidade: true },
      _count: { id: true },
    });
  }

  // 📉 Produtos com baixo estoque (alerta)
  async estoqueBaixo(limite: number = 5) {
    return this.prisma.estoque.findMany({
      where: { quantidade: { lte: limite } },
      include: { produto: true, filial: true },
    });
  }

  // 📊 Ordens de serviço por status
  async ordensPorStatus() {
    return this.prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { id: true },
    });
  }
}
