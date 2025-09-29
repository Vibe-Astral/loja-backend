import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

// DTOs
import { RelatorioVendasDto } from './dto/relatorio-vendas.dto';
import { RelatorioProdutosDto } from './dto/relatorio-produtos.dto';
import { RelatorioEstoqueDto } from './dto/relatorio-estoque.dto';
import { RelatorioOrdensDto } from './dto/relatorio-ordens.dto';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RelatoriosController {
    constructor(private readonly relatoriosService: RelatoriosService) { }

    // 📊 Consolidado de vendas (total, ticket médio, ranking)
    @Roles(Role.ADMIN)
    @Get('vendas')
    async relatorioVendas(
        @Query('inicio') inicio?: string,
        @Query('fim') fim?: string,
    ) {
        return this.relatoriosService.relatorioVendas(
            inicio ? new Date(inicio) : undefined,
            fim ? new Date(fim) : undefined,
        );
    }

    // 📊 Produtos mais vendidos
    @Roles(Role.ADMIN)
    @Get('produtos-mais-vendidos')
    async produtosMaisVendidos(
        @Query('inicio') inicio: string,
        @Query('fim') fim: string,
    ): Promise<RelatorioProdutosDto[]> {
        return this.relatoriosService.produtosMaisVendidos(
            new Date(inicio),
            new Date(fim),
        );
    }

    // 📉 Estoque baixo
    @Roles(Role.ADMIN)
    @Get('estoque-baixo')
    async estoqueBaixo(
        @Query('limite') limite: string,
    ): Promise<RelatorioEstoqueDto[]> {
        return this.relatoriosService.estoqueBaixo(Number(limite) || 5);
    }

    // 📑 Ordens de serviço por status
    @Roles(Role.ADMIN)
    @Get('ordens')
    async ordens(): Promise<RelatorioOrdensDto[]> {
        return this.relatoriosService.ordensPorStatus();
    }

    // 📊 Vendas por filial
    @Roles(Role.ADMIN)
    @Get('vendas-filial')
    async vendasPorFilial(
        @Query('inicio') inicio?: string,
        @Query('fim') fim?: string,
    ): Promise<RelatorioVendasDto[]> {
        return this.relatoriosService.vendasPorFilial(
            inicio ? new Date(inicio) : undefined,
            fim ? new Date(fim) : undefined,
        );
    }

    // 📊 Ranking de consultores
    @Roles(Role.ADMIN)
    @Get('ranking-consultores')
    async rankingConsultores(
        @Query('inicio') inicio?: string,
        @Query('fim') fim?: string,
    ): Promise<RelatorioVendasDto[]> {
        return this.relatoriosService.rankingConsultores(
            inicio ? new Date(inicio) : undefined,
            fim ? new Date(fim) : undefined,
        );
    }

    // 📦 Movimentações por período
    @Roles(Role.ADMIN)
    @Get('movimentacoes')
    async movimentacoes(
        @Query('inicio') inicio?: string,
        @Query('fim') fim?: string,
    ) {
        return this.relatoriosService.movimentacoesPorPeriodo(
            inicio ? new Date(inicio) : undefined,
            fim ? new Date(fim) : undefined,
        );
    }

    // 📊 Dashboard resumido
    @Roles(Role.ADMIN)
    @Get('dashboard')
    async dashboard() {
        return this.relatoriosService.dashboardResumo();
    }
}
