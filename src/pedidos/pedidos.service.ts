import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, $Enums } from '@prisma/client';
import { EstoqueService } from '../estoque/estoque.service';
@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private estoqueService: EstoqueService, // 👈 injetar aqui
  ) { }
  async criar(data: { tecnicoId: string; produtoId: string; quantidade: number }) {
    console.log("📝 Criando pedido com dados:", data);

    return this.prisma.pedidoEstoque.create({
      data: {
        tecnicoId: data.tecnicoId,
        produtoId: data.produtoId,
        quantidade: data.quantidade,
      },
      include: {
        produto: true,
        tecnico: { select: { id: true, email: true } },
      },
    });
  }
  async listarPorTecnico(tecnicoId: string) {
    return this.prisma.pedidoEstoque.findMany({
      where: { tecnicoId },
      include: { produto: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async listarPendentes() {
    return this.prisma.pedidoEstoque.findMany({
      where: { status: 'PENDENTE' },
      include: { produto: true, tecnico: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async aprovarPedido(id: string) {
    return this.prisma.pedidoEstoque.update({
      where: { id },
      data: { status: 'APROVADO' },
    });
  }

  async rejeitarPedido(id: string) {
    return this.prisma.pedidoEstoque.update({
      where: { id },
      data: { status: 'REJEITADO' },
    });
  }
  async atualizarStatus(id: string, status: $Enums.StatusPedido) {
    if (!Object.values($Enums.StatusPedido).includes(status)) {
      throw new BadRequestException("Status inválido");
    }

    const pedido = await this.prisma.pedidoEstoque.update({
      where: { id },
      data: { status },
      include: { produto: true, tecnico: true, filialDestino: true },
    });

    if (status === $Enums.StatusPedido.DEVOLUCAO_APROVADA) {
      if (!pedido.filialDestinoId) {
        throw new BadRequestException("Pedido de devolução sem filial de destino.");
      }

      await this.estoqueService.transferirDoTecnicoParaFilial(
        pedido.produtoId,
        pedido.tecnicoId,
        pedido.quantidade,
        pedido.filialDestinoId,
      );
    }

    return pedido;
  }


  async solicitarDevolucao(
    tecnicoId: string,
    produtoId: string,
    quantidade: number,
    filialDestinoId: string,
  ) {
    if (!tecnicoId) {
      throw new BadRequestException("Técnico não identificado no token");
    }

    return this.prisma.pedidoEstoque.create({
      data: {
        tecnicoId,
        produtoId,
        quantidade,
        filialDestinoId,
        status: "DEVOLUCAO_PENDENTE",
      },
      include: {
        produto: true,
        tecnico: { select: { id: true, email: true } },
      },
    });
  }
  async listarDevolucoesPendentes() {
    return this.prisma.pedidoEstoque.findMany({
      where: { status: 'DEVOLUCAO_PENDENTE' },
      include: { produto: true, tecnico: true },
      orderBy: { createdAt: 'desc' },
    });
  }

}
