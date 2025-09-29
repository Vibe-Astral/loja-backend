/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimentacaoService } from '../movimentacao/movimentacao.service';

@Injectable()
export class VendasService {
  constructor(
    private prisma: PrismaService,
    private movimentacaoService: MovimentacaoService,
  ) {}

  async criarVenda(
    consultorId: string,
    clienteId: string | null,
    clienteNome: string | null,
    items: { produtoId: string; quantidade: number }[],
  ) {
    let total = 0;
    const vendaItems: { produtoId: string; quantidade: number; preco: number }[] = [];

    // validar consultor
    const consultor = await this.prisma.user.findUnique({
      where: { id: consultorId },
    });
    if (!consultor) throw new NotFoundException('Consultor não encontrado');

    for (const item of items) {
      const produto = await this.prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) throw new NotFoundException('Produto não encontrado');

      // valida estoque do consultor
      const estoque = await this.prisma.estoque.findFirst({
        where: { produtoId: produto.id, tecnicoId: consultorId },
      });
      if (!estoque || estoque.quantidade < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para ${produto.nome}`);
      }

      // registrar movimentação de VENDA
      await this.movimentacaoService.registrarMovimentacao(
        produto.id,
        'VENDA',
        item.quantidade,
        undefined, // origem filial
        undefined, // destino filial
        consultorId, // origem técnico
        undefined, // destino técnico
      );

      total += produto.preco * item.quantidade;
      vendaItems.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        preco: produto.preco,
      });
    }

    return this.prisma.venda.create({
      data: {
        consultorId,
        clienteId: clienteId || null,
        clienteNome: clienteNome || null,
        total,
        items: { create: vendaItems },
      },
      include: {
        consultor: true,
        cliente: true,
        items: { include: { produto: true } },
      },
    });
  }

  async listarVendas() {
    return this.prisma.venda.findMany({
      include: {
        consultor: true,
        cliente: true,
        items: { include: { produto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listarMinhasVendas(consultorId: string) {
    return this.prisma.venda.findMany({
      where: { consultorId },
      include: {
        cliente: true,
        items: { include: { produto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detalharVenda(id: string) {
    return this.prisma.venda.findUnique({
      where: { id },
      include: {
        consultor: true,
        cliente: true,
        items: { include: { produto: true } },
      },
    });
  }

  async relatorioConsultor(consultorId: string) {
    const vendas = await this.prisma.venda.findMany({
      where: { consultorId },
      include: { items: true },
    });

    const total = vendas.reduce((acc, v) => acc + v.total, 0);
    const qtd = vendas.length;
    const ticketMedio = qtd > 0 ? total / qtd : 0;

    return { total, qtd, ticketMedio };
  }
}
