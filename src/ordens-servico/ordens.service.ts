import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TipoMovimentacao } from '@prisma/client';

@Injectable()
export class OrdensService {
  constructor(private prisma: PrismaService) { }

  async criarOrdem(dto: CreateOrdemDto) {
    const codigo = 'OS-' + Math.floor(100000 + Math.random() * 900000);

    return this.prisma.ordemServico.create({
      data: {
        codigo,
        clienteId: dto.clienteId,
        tecnicoId: dto.tecnicoId,
        descricao: dto.descricao,
      },
    });
  }

  async adicionarItem(dto: AddItemDto) {
    const ordem = await this.prisma.ordemServico.findUnique({ where: { id: dto.ordemId } });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // cria item da O.S.
    const item = await this.prisma.ordemServicoItem.create({
      data: {
        ordemId: dto.ordemId,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        observacao: dto.observacao,
      },
    });

    // registra saída do estoque (origem: técnico da O.S., se houver)
    await this.prisma.movimentacaoEstoque.create({
      data: {
        tipo: TipoMovimentacao.SAIDA,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        origemTecnicoId: ordem.tecnicoId ?? null,
      },
    });

    return item;
  }

  async atualizarStatus(dto: UpdateStatusDto) {
    const ordem = await this.prisma.ordemServico.findUnique({ where: { id: dto.ordemId } });
    if (!ordem) throw new NotFoundException('Ordem não encontrada');

    return this.prisma.ordemServico.update({
      where: { id: dto.ordemId },
      data: { status: dto.status },
    });
  }

  async listar() {
    return this.prisma.ordemServico.findMany({
      include: {
        cliente: true,
        tecnico: true,
        itens: { include: { produto: true } },
      },
    });
  }

  async buscarPorId(id: string) {
    return this.prisma.ordemServico.findUnique({
      where: { id },
      include: {
        cliente: true,
        tecnico: true,
        itens: { include: { produto: true } },
      },
    });
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

}
