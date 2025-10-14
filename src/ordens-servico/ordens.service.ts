import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimentacaoService } from '../movimentacao/movimentacao.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TipoMovimentacao } from '@prisma/client';

@Injectable()
export class OrdensService {
  constructor(
    private prisma: PrismaService,
    private movimentacaoService: MovimentacaoService, // 👈 injeta aqui
  ) { }

  async criarOrdem(dto: CreateOrdemDto) {
    const codigo = 'OS-' + Math.floor(100000 + Math.random() * 900000);

    return this.prisma.ordemServico.create({
      data: {
        codigo,
        descricao: dto.descricao,
        clienteId: dto.clienteId || null,
        clienteNome: dto.clienteNome || null,
        tecnicoId: dto.tecnicoId,
      },
      include: {
        tecnico: { select: { id: true, nome: true, email: true } },
        cliente: { select: { id: true, nome: true, email: true } },
      },
    });
  }


  async adicionarItem(dto: AddItemDto) {
    const ordem = await this.prisma.ordemServico.findUnique({
      where: { id: dto.ordemId },
    });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    const produto = await this.prisma.produto.findUnique({
      where: { id: dto.produtoId },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // cria o item dentro da O.S.
    const item = await this.prisma.ordemServicoItem.create({
      data: {
        ordemId: dto.ordemId,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        observacao: dto.observacao,
      },
    });

    // registra a movimentação corretamente via service
    await this.movimentacaoService.registrarMovimentacao(
      dto.produtoId,
      TipoMovimentacao.SAIDA,
      dto.quantidade,
      undefined, // origemFilialId
      undefined, // destinoFilialId
      ordem.tecnicoId ?? undefined, // origemTecnicoId
      undefined, // destinoTecnicoId
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

    // Atualiza status
    const ordemAtualizada = await this.prisma.ordemServico.update({
      where: { id: dto.ordemId },
      data: { status: dto.status },
    });

    // Se for fechamento, gera venda
    if (dto.status === 'FECHADA' && ordem.itens.length > 0) {
      const total = ordem.itens.reduce(
        (acc, i) => acc + i.quantidade * (i.produto?.preco ?? 0),
        0
      );

      const venda = await this.prisma.venda.create({
        data: {
          consultorId: ordem.tecnicoId!, // técnico é o vendedor
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

      // Atualiza movimentações tipo SAIDA → VENDA
      await this.prisma.movimentacaoEstoque.updateMany({
        where: {
          tipo: 'SAIDA',
          origemTecnicoId: ordem.tecnicoId,
        },
        data: { tipo: 'VENDA' },
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async listarOrdens() {
    return this.prisma.ordemServico.findMany({
      include: {
        tecnico: { select: { id: true, nome: true, email: true } },
        cliente: { select: { id: true, nome: true, email: true } },
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return this.prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tecnico: { select: { id: true, nome: true, email: true } },
        cliente: { select: { id: true, nome: true, email: true } },
        itens: { include: { produto: true } },
      },
    });
  }

  async assumirOrdem(ordemId: string, tecnicoId: string) {
    const ordem = await this.prisma.ordemServico.findUnique({ where: { id: ordemId } });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    if (ordem.status !== 'ABERTA') {
      throw new BadRequestException('Apenas ordens abertas podem ser assumidas');
    }

    if (ordem.tecnicoId) {
      throw new BadRequestException('Essa O.S. já possui um técnico designado');
    }

    return this.prisma.ordemServico.update({
      where: { id: ordemId },
      data: { tecnicoId },
      include: { cliente: true, tecnico: true },
    });
  }
}
