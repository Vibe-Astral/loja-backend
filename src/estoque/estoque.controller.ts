import {
    Controller,
    Get,
    Param,
    UseGuards,
    Req, Post, Body,
    ForbiddenException
} from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('estoque')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstoqueController {
    constructor(private readonly estoqueService: EstoqueService) { }

    @Get('posicoes')
    listarPosicoes() {
        return this.estoqueService.listarPosicoes();
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async listarTodos(@Req() req) {
        if (req.user.role !== "ADMIN") {
            throw new ForbiddenException("Acesso negado");
        }
        return this.estoqueService.listarTodos();
    }

    @Get('saldo')
    saldoGeralPorProduto() {
        return this.estoqueService.saldoGeralPorProduto();
    }

    @Get('saldo/:produtoId')
    saldoProduto(@Param('produtoId') produtoId: string) {
        return this.estoqueService.saldoProduto(produtoId);
    }

    @Get('filial/:filialId')
    listarPorFilial(@Param('filialId') filialId: string) {
        return this.estoqueService.listarPorFilial(filialId);
    }
    @Get('tecnico/me')
    @UseGuards(JwtAuthGuard)
    async meuEstoque(@Req() req: any) {
        return this.estoqueService.listarPorTecnico(req.user.id);
    }

    @Get('tecnico/:tecnicoId')
    listarPorTecnico(@Param('tecnicoId') tecnicoId: string) {
        return this.estoqueService.listarPorTecnico(tecnicoId);
    }

    @Get('filial/:filialId/produto/:produtoId')
    obterEstoqueProdutoEmFilial(@Param('produtoId') produtoId: string, @Param('filialId') filialId: string) {
        return this.estoqueService.obterEstoqueProdutoEmFilial(produtoId, filialId);
    }

    @Get('tecnico/:tecnicoId/produto/:produtoId')
    obterEstoqueProdutoDeTecnico(@Param('produtoId') produtoId: string, @Param('tecnicoId') tecnicoId: string) {
        return this.estoqueService.obterEstoqueProdutoDeTecnico(produtoId, tecnicoId);
    }
    @Post('transferir')
    async transferirEstoque(
        @Body()
        body: {
            produtoId: string;
            origemFilialId: string;
            destinoFilialId: string;
            quantidade: number;
        },
    ) {
        return this.estoqueService.transferir(
            body.produtoId,
            body.origemFilialId,
            body.destinoFilialId,
            body.quantidade,
        );
    }
    @Post('transferir')
    async transferirEstoque(
        @Body()
        body: {
            produtoId: string;
            origemFilialId: string;
            destinoFilialId?: string;
            destinoTecnicoId?: string;
            quantidade: number;
        },
    ) {
        if (!body?.quantidade || body.quantidade <= 0) {
            throw new BadRequestException('Quantidade deve ser maior que zero.');
        }

        if (body.destinoTecnicoId) {
            // Filial -> Técnico
            return this.estoqueService.transferirParaTecnico(
                body.produtoId,
                body.origemFilialId,
                body.destinoTecnicoId,
                body.quantidade,
            );
        }

        if (!body.destinoFilialId) {
            throw new BadRequestException('Informe destinoFilialId ou destinoTecnicoId.');
        }

        // Filial -> Filial (com movimentação registrada)
        return this.estoqueService.transferir(
            body.produtoId,
            body.origemFilialId,
            body.destinoFilialId,
            body.quantidade,
        );
    }
}
