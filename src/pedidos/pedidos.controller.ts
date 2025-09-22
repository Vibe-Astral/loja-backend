// src/pedidos/pedidos.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { $Enums } from '@prisma/client';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  async criarPedido(
    @Body() body: { produtoId: string; quantidade: number },
    @Req() req: any,
  ) {
    return this.pedidosService.criar({
      tecnicoId: req.user.id, // ✅ padronizado
      produtoId: body.produtoId,
      quantidade: body.quantidade,
    });
  }

  @Get('me')
  async meusPedidos(@Req() req: any) {
    const tecnicoId = req.user.id; // ✅ corrigido
    return this.pedidosService.listarPorTecnico(tecnicoId);
  }

  @Get('pendentes')
  async listarPendentes() {
    return this.pedidosService.listarPendentes();
  }

  @Get('devolucoes/pendentes')
  async listarDevolucoesPendentes() {
    return this.pedidosService.listarDevolucoesPendentes();
  }

  @Patch(':id')
  async atualizarStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' },
  ) {
    return this.pedidosService.atualizarStatus(
      id,
      body.status as $Enums.StatusPedido,
    );
  }

  @Patch(':id/aprovar')
  async aprovar(@Param('id') id: string) {
    return this.pedidosService.aprovarPedido(id);
  }

  @Patch(':id/rejeitar')
  async rejeitar(@Param('id') id: string) {
    return this.pedidosService.rejeitarPedido(id);
  }

  @Post('devolucao')
  async solicitarDevolucao(
    @Body()
    body: { produtoId: string; quantidade: number; filialDestinoId: string },
    @Req() req: any,
  ) {
    return this.pedidosService.solicitarDevolucao(
      req.user.id, // ✅ padronizado
      body.produtoId,
      body.quantidade,
      body.filialDestinoId,
    );
  }
}
