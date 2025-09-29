/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { CriarEntradaDto, CriarSaidaDto, CriarTransferenciaDto } from './dto/create-movimentacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CriarVendaDto } from './dto/criar-venda.dto';

@Controller('movimentacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimentacaoController {
  constructor(private readonly movimentacaoService: MovimentacaoService) { }

  // consultas
  @Get()
  listarTodas() {
    return this.movimentacaoService.listarTodas();
  }

  @Get('produto/:id')
  listarPorProduto(@Param('id') id: string) {
    return this.movimentacaoService.listarPorProduto(id);
  }

  @Get('tecnico/:id')
  listarPorTecnico(@Param('id') id: string) {
    return this.movimentacaoService.listarPorTecnico(id);
  }

  @Get('filial/:id')
  listarPorFilial(@Param('id') id: string) {
    return this.movimentacaoService.listarPorFilial(id);
  }

  // criação
  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  @Post('entrada')
  registrarEntrada(@Body() dto: CriarEntradaDto) {
    return this.movimentacaoService.registrarMovimentacao(
      dto.produtoId, 'ENTRADA', dto.quantidade,
      undefined, dto.destinoFilialId,
      undefined, dto.destinoTecnicoId,
    );
  }

  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  @Post('saida')
  registrarSaida(@Body() dto: CriarSaidaDto) {
    return this.movimentacaoService.registrarMovimentacao(
      dto.produtoId, 'SAIDA', dto.quantidade,
      dto.origemFilialId, undefined,
      dto.origemTecnicoId, undefined,
    );
  }

  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  @Post('transferencia')
  registrarTransferencia(@Body() dto: CriarTransferenciaDto) {
    return this.movimentacaoService.registrarMovimentacao(
      dto.produtoId, 'TRANSFERENCIA', dto.quantidade,
      dto.origemFilialId, dto.destinoFilialId,
      dto.origemTecnicoId, dto.destinoTecnicoId,
    );
  }
  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Post('venda')
  registrarVenda(@Body() dto: CriarVendaDto) {
    return this.movimentacaoService.registrarMovimentacao(
      dto.produtoId,
      'VENDA',
      dto.quantidade,
      undefined, // origemFilial
      undefined, // destinoFilial
      dto.consultorId, // origemTecnico
      undefined, // destinoTecnico
    );
  }

}
