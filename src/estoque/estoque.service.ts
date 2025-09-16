import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstoqueService {
    constructor(private prisma: PrismaService) { }

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

    // Saldo geral por produto (lista todos com soma)
    async saldoGeralPorProduto() {
        const agg = await this.prisma.estoque.groupBy({
            by: ['produtoId'],
            _sum: { quantidade: true },
        });

        // enriquecer com dados do produto
        const produtosMap = new Map<string, any>();
        const ids = agg.map(a => a.produtoId);
        const produtos = await this.prisma.produto.findMany({ where: { id: { in: ids } } });
        produtos.forEach(p => produtosMap.set(p.id, p));

        return agg.map(a => ({
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
            include: { produto: true, tecnico: { select: { id: true, email: true } } },
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
            include: { produto: true, tecnico: { select: { id: true, email: true } } },
        });
        return pos ?? { produtoId, tecnicoId, quantidade: 0 };
    }
    async transferir(
        produtoId: string,
        origemFilialId: string,
        destinoFilialId: string,
        quantidade: number,
    ) {
        if (origemFilialId === destinoFilialId) {
            throw new BadRequestException('A filial de origem e destino não podem ser a mesma.');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Verifica estoque de origem
            const origem = await tx.estoque.findFirst({
                where: { produtoId, filialId: origemFilialId },
            });

            if (!origem || origem.quantidade < quantidade) {
                throw new BadRequestException('Estoque insuficiente na filial de origem.');
            }

            // 2. Decrementa da origem
            await tx.estoque.update({
                where: { id: origem.id },
                data: { quantidade: origem.quantidade - quantidade },
            });

            // 3. Adiciona no destino (se não existir, cria)
            let destino = await tx.estoque.findFirst({
                where: { produtoId, filialId: destinoFilialId },
            });

            if (!destino) {
                destino = await tx.estoque.create({
                    data: {
                        produtoId,
                        filialId: destinoFilialId,
                        quantidade: 0,
                    },
                });
            }

            await tx.estoque.update({
                where: { id: destino.id },
                data: { quantidade: destino.quantidade + quantidade },
            });

            return { message: 'Transferência realizada com sucesso!' };
        });
    }
    // src/estoque/estoque.service.ts
    async transferirDoTecnicoParaFilial(
        produtoId: string,
        tecnicoId: string,
        quantidade: number,
        filialId: string, // precisa da filial de destino
    ) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Verifica estoque do técnico
            const origem = await tx.estoque.findFirst({
                where: { produtoId, tecnicoId },
            });

            if (!origem || origem.quantidade < quantidade) {
                throw new BadRequestException("Estoque insuficiente no técnico.");
            }

            // 2. Decrementa do técnico
            await tx.estoque.update({
                where: { id: origem.id },
                data: { quantidade: origem.quantidade - quantidade },
            });

            // 3. Adiciona na filial (se não existir, cria)
            let destino = await tx.estoque.findFirst({
                where: { produtoId, filialId },
            });

            if (!destino) {
                destino = await tx.estoque.create({
                    data: {
                        produtoId,
                        filialId,
                        quantidade: 0,
                    },
                });
            }

            await tx.estoque.update({
                where: { id: destino.id },
                data: { quantidade: destino.quantidade + quantidade },
            });

            return { message: "Devolução concluída com sucesso!" };
        });
    }

}
