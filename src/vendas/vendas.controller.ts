import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(private readonly vendasService: VendasService) { }

  @Post()
  async criarVenda(@Req() req, @Body() body) {
    const consultorId = req.user.id;

    return this.vendasService.criarVenda(
      consultorId,
      body.clienteId || null,
      body.clienteNome || null,
      body.items,
    );
  }

  @Get()
  async listar() {
    return this.vendasService.listarVendas();
  }

  @Get('minhas')
  async listarMinhas(@Req() req) {
    return this.vendasService.listarMinhasVendas(req.user.id);
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.vendasService.detalharVenda(id);
  }

  @Get('relatorio/minhas')
  async relatorio(@Req() req) {
    return this.vendasService.relatorioConsultor(req.user.id);
  }
}
