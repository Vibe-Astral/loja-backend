// src/ordens/ordens.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimentacaoService } from '../movimentacao/movimentacao.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Prisma, TipoMovimentacao } from '@prisma/client';

@Injectable()
export class OrdensService {
  constructor(
    private prisma: PrismaService,
    private movimentacaoService: MovimentacaoService,
  ) {}

  async criarOrdem(dto: CreateOrdemDto) {
    const codigo = 'OS-' + Math.floor(100000 + Math.random() * 900000);
    return this.prisma.ordemServico.create({
      data: {
        codigo,
        descricao: dto.descricao,
        clienteId: dto.clienteId || null,
        clienteNome: dto.clienteNome || null,
        tecnicoId: dto.tecnicoId || null,
      },
      include: {
        tecnico: { select: { id: true, nome: true, email: true } },
        cliente: { select: { id: true, nome: true, email: true } },
      },
    });
  }

  async adicionarItem(dto: AddItemDto) {
    const ordem = await this.prisma.ordemServico.findUnique({ where: { id: dto.ordemId } });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const item = await this.prisma.ordemServicoItem.create({
      data: {
        ordemId: dto.ordemId,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        observacao: dto.observacao,
      },
    });

    // saída do estoque do técnico responsável
    await this.movimentacaoService.registrarMovimentacao(
      dto.produtoId,
      TipoMovimentacao.SAIDA,           // ✅ corrigido
      dto.quantidade,
      undefined,
      undefined,
      ordem.tecnicoId ?? undefined,
      undefined,
    );

    return item;
  }

  async atualizarStatus(dto: UpdateStatusDto) {
    const ordem = await this.prisma.ordemServico.findUnique({
      where: { id: dto.ordemId },
      include: {
        itens: { include: { produto: true } },
        tecnico: true,
        cliente: true,
      },
    });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    const ordemAtualizada = await this.prisma.ordemServico.update({
      where: { id: dto.ordemId },
      data: { status: dto.status },
    });

    if (dto.status === 'FECHADA' && ordem.itens.length > 0) {
      const total = ordem.itens.reduce(
        (acc, i) => acc + i.quantidade * (i.produto?.preco ?? 0),
        0,
      );

      const venda = await this.prisma.venda.create({
        data: {
          consultorId: ordem.tecnicoId!,
          clienteId: ordem.clienteId,
          clienteNome: ordem.clienteNome,
          total,
          ordemId: ordem.id,
          items: {
            create: ordem.itens.map((i) => ({
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              preco: i.produto?.preco ?? 0,
            })),
          },
        },
      });

      return { ordem: ordemAtualizada, vendaGerada: venda };
    }

    return ordemAtualizada;
  }

  async listarComFiltro(filtro: any) {
    return this.prisma.ordemServico.findMany({
      where: filtro,
      include: {
        cliente: true,
        tecnico: true,
        itens: { include: { produto: true } },
        venda: { select: { id: true, total: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    return this.prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tecnico: { select: { id: true, nome: true, email: true } },
        cliente: { select: { id: true, nome: true, email: true } },
        itens: { include: { produto: true } },
        venda: { select: { id: true, total: true, createdAt: true } },
      },
    });
  }

  async assumirOrdem(ordemId: string, tecnicoId: string) {
    const ordem = await this.prisma.ordemServico.findUnique({ where: { id: ordemId } });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');
    if (ordem.status !== 'ABERTA')
      throw new BadRequestException('Apenas ordens abertas podem ser assumidas');
    if (ordem.tecnicoId)
      throw new BadRequestException('Essa O.S. já possui um técnico designado');

    return this.prisma.ordemServico.update({
      where: { id: ordemId },
      data: { tecnicoId, status: 'EM_ANDAMENTO' },
      include: { cliente: true, tecnico: true },
    });
  }

  async reabrirOrdem(ordemId: string) {
    const ordem = await this.prisma.ordemServico.findUnique({
      where: { id: ordemId },
      include: {
        itens: true,
        venda: { include: { items: true } },
      },
    });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');
    if (ordem.status !== 'FECHADA')
      throw new BadRequestException('Somente O.S. fechada pode ser reaberta');
    if (!ordem.tecnicoId)
      throw new BadRequestException('O.S. sem técnico não pode ser reaberta (sem destino de devolução)');

    return this.prisma.$transaction(async (tx) => {
      for (const item of ordem.itens as Array<{ produtoId: string; quantidade: number }>) {
        await this.movimentacaoService.registrarMovimentacao(
          item.produtoId,
          TipoMovimentacao.ENTRADA,
          item.quantidade,
          undefined,
          undefined,
          undefined,
          ordem.tecnicoId ?? undefined,
        );
      }

      await tx.venda.deleteMany({ where: { ordemId } });

      await tx.movimentacaoEstoque.updateMany({
        where: {
          tipo: 'VENDA',
          origemTecnicoId: ordem.tecnicoId,
          produtoId: { in: ordem.itens.map((i) => i.produtoId) },
        },
        data: { tipo: 'SAIDA' },
      });

      return tx.ordemServico.update({
        where: { id: ordemId },
        data: { status: 'EM_ANDAMENTO' },
        include: {
          itens: { include: { produto: true } },
          venda: { select: { id: true } },
        },
      });
    });
  }
}
