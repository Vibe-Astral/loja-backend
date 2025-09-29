import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Estoque, TipoMovimentacao } from '@prisma/client';

const includeAll = {
  produto: true,
  origemFilial: true,
  destinoFilial: true,
  origemTecnico: true,
  destinoTecnico: true,
} as const;

@Injectable()
export class MovimentacaoService {
  constructor(private prisma: PrismaService) { }

  async listarTodas() {
    return this.prisma.movimentacaoEstoque.findMany({
      orderBy: { createdAt: 'desc' },
      include: includeAll,
    });
  }

  async listarPorProduto(produtoId: string) {
    return this.prisma.movimentacaoEstoque.findMany({
      where: { produtoId },
      orderBy: { createdAt: 'desc' },
      include: includeAll,
    });
  }

  async listarPorTecnico(tecnicoId: string) {
    return this.prisma.movimentacaoEstoque.findMany({
      where: { OR: [{ origemTecnicoId: tecnicoId }, { destinoTecnicoId: tecnicoId }] },
      orderBy: { createdAt: 'desc' },
      include: includeAll,
    });
  }

  async listarPorFilial(filialId: string) {
    return this.prisma.movimentacaoEstoque.findMany({
      where: { OR: [{ origemFilialId: filialId }, { destinoFilialId: filialId }] },
      orderBy: { createdAt: 'desc' },
      include: includeAll,
    });
  }

  /**
   * Regras:
   * - ENTRADA: precisa de um destino (filial OU técnico).
   * - SAIDA: precisa de uma origem (filial OU técnico) e valida estoque.
   * - TRANSFERENCIA: precisa origem e destino (não podem ser iguais) e valida estoque na origem.
   */
  async registrarMovimentacao(
    produtoId: string,
    tipo: TipoMovimentacao,
    quantidade: number,
    origemFilialId?: string,
    destinoFilialId?: string,
    origemTecnicoId?: string,
    destinoTecnicoId?: string,
  ) {
    if (quantidade <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');

    // valida existência do produto
    const produto = await this.prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // helpers para consistência (não permitir dois destinos/origens ao mesmo tempo)
    const origemTargets = [origemFilialId, origemTecnicoId].filter(Boolean).length;
    const destinoTargets = [destinoFilialId, destinoTecnicoId].filter(Boolean).length;

    if (tipo === 'ENTRADA') {
      if (destinoTargets !== 1) {
        throw new BadRequestException('Entrada requer exatamente um destino (filial OU técnico)');
      }
    }

    if (tipo === 'SAIDA' || tipo === 'VENDA') {
      if (origemTargets !== 1) {
        throw new BadRequestException(`${tipo} requer exatamente uma origem (filial OU técnico)`);
      }
    }


    if (tipo === 'TRANSFERENCIA') {
      if (origemTargets !== 1 || destinoTargets !== 1) {
        throw new BadRequestException('Transferência requer uma origem e um destino (um de cada)');
      }
      if ((origemFilialId && destinoFilialId && origemFilialId === destinoFilialId) ||
        (origemTecnicoId && destinoTecnicoId && origemTecnicoId === destinoTecnicoId)) {
        throw new BadRequestException('Origem e destino não podem ser iguais');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // funçõezinhas auxiliares pra localizar/alterar estoque “exato”
      const findEstoque = async (loc: { filialId?: string | null; tecnicoId?: string | null; }): Promise<Estoque | null> => {
        return tx.estoque.findFirst({
          where: {
            produtoId,
            filialId: loc.filialId ?? null,
            tecnicoId: loc.tecnicoId ?? null,
          },
        });
      };

      const ensureDestino = async (loc: { filialId?: string | null; tecnicoId?: string | null; }) => {
        let dest = await findEstoque(loc);
        if (!dest) {
          dest = await tx.estoque.create({
            data: {
              produtoId,
              quantidade: 0,
              filialId: loc.filialId ?? null,
              tecnicoId: loc.tecnicoId ?? null,
            },
          });
        }
        return dest;
      };

      // SAÍDA / TRANSFERÊNCIA: precisa validar estoque na ORIGEM
      if (tipo !== 'ENTRADA') {
        const origem = await findEstoque({
          filialId: origemFilialId ?? null,
          tecnicoId: origemTecnicoId ?? null,
        });
        if (!origem || origem.quantidade < quantidade) {
          throw new BadRequestException('Estoque insuficiente na origem');
        }
        await tx.estoque.update({
          where: { id: origem.id },
          data: { quantidade: origem.quantidade - quantidade },
        });
      }

      // ENTRADA / TRANSFERÊNCIA: credita no DESTINO
      if (tipo !== 'SAIDA') {
        const destino = await ensureDestino({
          filialId: destinoFilialId ?? null,
          tecnicoId: destinoTecnicoId ?? null,
        });
        await tx.estoque.update({
          where: { id: destino.id },
          data: { quantidade: destino.quantidade + quantidade },
        });
      }

      // histórico
      return tx.movimentacaoEstoque.create({
        data: {
          tipo,
          quantidade,
          produtoId,
          origemFilialId: origemFilialId ?? null,
          destinoFilialId: destinoFilialId ?? null,
          origemTecnicoId: origemTecnicoId ?? null,
          destinoTecnicoId: destinoTecnicoId ?? null,
        },
        include: includeAll,
      });
    });
  }
}
