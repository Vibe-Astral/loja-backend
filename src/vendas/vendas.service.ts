import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendasService {
  constructor(private prisma: PrismaService) { }

  import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendasService {
  constructor(private prisma: PrismaService) { }

  async criarVenda(
    consultorId: string,
    clienteId: string | null,
    clienteNome: string | null,
    items: { produtoId: string; quantidade: number }[],
  ) {
    let total = 0;
    const vendaItems: { produtoId: string; quantidade: number; preco: number }[] = [];

    // Filial do consultor
    const consultor = await this.prisma.user.findUnique({
      where: { id: consultorId },
      select: { filialId: true },
    });
    if (!consultor?.filialId) {
      throw new BadRequestException('Consultor não vinculado a nenhuma filial');
    }

    for (const item of items) {
      const produto = await this.prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) throw new NotFoundException('Produto não encontrado');

      const estoque = await this.prisma.estoque.findFirst({
        where: { produtoId: produto.id, filialId: consultor.filialId },
      });
      if (!estoque) throw new NotFoundException(`Estoque não encontrado para ${produto.nome}`);
      if (estoque.quantidade < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para ${produto.nome}`);
      }

      await this.prisma.estoque.update({
        where: { id: estoque.id },
        data: { quantidade: { decrement: item.quantidade } },
      });

      total += produto.preco * item.quantidade;
      vendaItems.push({ produtoId: produto.id, quantidade: item.quantidade, preco: produto.preco });
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
        cliente: true, // 👈 agora também traz o cliente
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
