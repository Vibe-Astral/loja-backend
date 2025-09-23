/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';
import { EstoqueService } from '../estoque/estoque.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private estoqueService: EstoqueService,
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
    // Busca pedido e informações do técnico
    const pedido = await this.prisma.pedidoEstoque.findUnique({
      where: { id },
      include: {
        produto: true,
        tecnico: true, // já pega o user do técnico
      },
    });

    if (!pedido) {
      throw new BadRequestException("Pedido não encontrado");
    }

    // 🔹 Se o técnico não tiver filial vinculada, usa a Filial Principal como padrão
    let filialOrigemId = pedido.tecnico?.filialId;
    if (!filialOrigemId) {
      const filialPadrao = await this.prisma.filial.findFirst({
        where: { nome: "Filial Principal" }, // ajuste para o nome que você usa
      });

      if (!filialPadrao) {
        throw new BadRequestException(
          "Técnico não possui filial vinculada e nenhuma filial padrão foi encontrada"
        );
      }

      filialOrigemId = filialPadrao.id;
    }

    // Verifica estoque na filial escolhida
    const estoqueFilial = await this.prisma.estoque.findFirst({
      where: { produtoId: pedido.produtoId, filialId: filialOrigemId },
    });

    if (!estoqueFilial || estoqueFilial.quantidade < pedido.quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente na filial de origem`
      );
    }

    // Faz a transferência: filial → técnico
    await this.estoqueService.transferirParaTecnico(
      pedido.produtoId,
      filialOrigemId,
      pedido.tecnicoId,
      pedido.quantidade,
    );

    // Atualiza status para APROVADO
    return this.prisma.pedidoEstoque.update({
      where: { id },
      data: { status: "APROVADO" },
      include: { produto: true, tecnico: true },
    });
  }




  async rejeitarPedido(id: string) {
    const pedido = await this.prisma.pedidoEstoque.findUnique({ where: { id } });
    if (!pedido) throw new BadRequestException('Pedido não encontrado');

    // ✅ rollback se já aprovado
    if (pedido.status === 'APROVADO') {
      await this.estoqueService.removerDoTecnico(
        pedido.tecnicoId,
        pedido.produtoId,
        pedido.quantidade,
      );
    }

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

    // ✅ devolução aprovada
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
