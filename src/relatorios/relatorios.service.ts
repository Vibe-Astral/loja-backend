/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelatorioVendasDto } from './dto/relatorio-vendas.dto';
import { RelatorioProdutosDto } from './dto/relatorio-produtos.dto';
import { RelatorioEstoqueDto } from './dto/relatorio-estoque.dto';
import { RelatorioOrdensDto } from './dto/relatorio-ordens.dto';

@Injectable()
export class RelatoriosService {
    constructor(private prisma: PrismaService) { }

    // 📊 Relatório consolidado de vendas
    async relatorioVendas(inicio?: Date, fim?: Date): Promise<{
        total: number;
        qtd: number;
        ticketMedio: number;
        produtosMaisVendidos: { nome: string; quantidade: number; total: number }[];
    }> {
        const where: any = {};
        if (inicio && fim) {
            where.createdAt = { gte: inicio, lte: fim };
        }

        const vendas = await this.prisma.venda.findMany({
            where,
            include: {
                consultor: true,
                items: { include: { produto: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = vendas.reduce((acc, v) => acc + v.total, 0);
        const qtd = vendas.length;
        const ticketMedio = qtd > 0 ? total / qtd : 0;

        // Ranking de produtos
        const produtosMap = new Map<
            string,
            { nome: string; quantidade: number; total: number }
        >();

        for (const v of vendas) {
            for (const item of v.items) {
                if (!produtosMap.has(item.produtoId)) {
                    produtosMap.set(item.produtoId, {
                        nome: item.produto.nome,
                        quantidade: 0,
                        total: 0,
                    });
                }
                const prod = produtosMap.get(item.produtoId)!;
                prod.quantidade += item.quantidade;
                prod.total += item.preco * item.quantidade;
            }
        }

        const produtosMaisVendidos = [...produtosMap.values()].sort(
            (a, b) => b.quantidade - a.quantidade,
        );

        return {
            total,
            qtd,
            ticketMedio,
            produtosMaisVendidos,
        };
    }
}

    // 📊 Produtos mais vendidos (via groupBy)
    async produtosMaisVendidos(inicio: Date, fim: Date): Promise < RelatorioProdutosDto[] > {
    const dados = await this.prisma.vendaItem.groupBy({
        by: ['produtoId'],
        where: { venda: { createdAt: { gte: inicio, lte: fim } } },
        _sum: { quantidade: true },
    });

    return Promise.all(
        dados.map(async (d) => {
            const produto = await this.prisma.produto.findUnique({ where: { id: d.produtoId } });
            return {
                produtoId: d.produtoId,
                nome: produto?.nome || "Desconhecido",
                quantidade: d._sum.quantidade || 0,
                faturamento: (produto?.preco || 0) * (d._sum.quantidade || 0),
            };
        }),
    );
}


    // 📉 Produtos com baixo estoque
    async estoqueBaixo(limite = 5): Promise < RelatorioEstoqueDto[] > {
    const dados = await this.prisma.estoque.findMany({
        where: { quantidade: { lte: limite } },
        include: { produto: true, filial: true },
    });

    return dados.map((e) => ({
        produtoId: e.produtoId,
        nome: e.produto.nome,
        quantidade: e.quantidade,
        filial: e.filial?.nome || "Sem filial",
    }));
}


    // 📑 Ordens de serviço por status
    async ordensPorStatus(): Promise < RelatorioOrdensDto[] > {
    const dados = await this.prisma.ordemServico.groupBy({
        by: ['status'],
        _count: { id: true },
    });

    return dados.map((o) => ({
        status: o.status,
        qtd: o._count.id,
    }));
}


    // 📊 Vendas por filial
    async vendasPorFilial(inicio ?: Date, fim ?: Date): Promise < RelatorioVendasDto[] > {
    const where: any = {};
    if(inicio && fim) where.createdAt = { gte: inicio, lte: fim };

const vendas = await this.prisma.venda.findMany({
    where,
    include: { consultor: { include: { filial: true } } },
});

const agrupado: Record<string, RelatorioVendasDto> = {};

for (const v of vendas) {
    const filialNome = v.consultor.filial?.nome || "Sem filial";
    if (!agrupado[filialNome]) {
        agrupado[filialNome] = {
            filial: filialNome,
            total: 0,
            qtd: 0,
            ticketMedio: 0,
        };
    }
    agrupado[filialNome].total += v.total;
    agrupado[filialNome].qtd++;
}

return Object.values(agrupado).map((f) => ({
    ...f,
    ticketMedio: f.qtd > 0 ? f.total / f.qtd : 0,
}));
    }

    // 📊 Ranking de consultores
    async rankingConsultores(inicio ?: Date, fim ?: Date) {
    const where: any = {};
    if (inicio || fim) {
        where.createdAt = {};
        if (inicio) where.createdAt.gte = inicio;
        if (fim) where.createdAt.lte = fim;
    }

    const vendas = await this.prisma.venda.findMany({
        where,
        include: { consultor: { select: { id: true, email: true, filial: true } } },
    });

    const agrupado: Record<string, any> = {};

    for (const v of vendas) {
        if (!agrupado[v.consultorId]) {
            agrupado[v.consultorId] = {
                consultorId: v.consultorId,
                email: v.consultor.email,
                filial: v.consultor.filial?.nome,
                total: 0,
                qtd: 0,
            };
        }
        agrupado[v.consultorId].total += v.total;
        agrupado[v.consultorId].qtd++;
    }

    return Object.values(agrupado).map((c: any) => ({
        ...c,
        ticketMedio: c.qtd > 0 ? c.total / c.qtd : 0,
    }));
}

    // 📦 Movimentações por período
    async movimentacoesPorPeriodo(inicio ?: Date, fim ?: Date) {
    const where: any = {};
    if (inicio || fim) {
        where.createdAt = {};
        if (inicio) where.createdAt.gte = inicio;
        if (fim) where.createdAt.lte = fim;
    }

    return this.prisma.movimentacaoEstoque.findMany({
        where,
        include: {
            produto: true,
            origemFilial: true,
            destinoFilial: true,
            origemTecnico: true,
            destinoTecnico: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

    // 📊 Dashboard resumido
    async dashboardResumo() {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const [faturamento, qtdVendas, ordens, baixoEstoque] = await Promise.all([
        this.prisma.venda.aggregate({
            where: { createdAt: { gte: inicioMes } },
            _sum: { total: true },
        }),
        this.prisma.venda.count({ where: { createdAt: { gte: inicioMes } } }),
        this.prisma.ordemServico.groupBy({
            by: ['status'],
            _count: { id: true },
        }),
        this.prisma.estoque.count({ where: { quantidade: { lte: 5 } } }),
    ]);

    const ticketMedio =
        qtdVendas > 0 ? (faturamento._sum.total || 0) / qtdVendas : 0;

    return {
        faturamento: faturamento._sum.total || 0,
        vendas: qtdVendas,
        ticketMedio,
        ordens,
        baixoEstoque,
    };
}
}
