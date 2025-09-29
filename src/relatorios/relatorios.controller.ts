import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  // Exemplo: /relatorios/vendas?inicio=2025-09-01&fim=2025-09-30
  @Roles(Role.ADMIN)
  @Get('vendas')
  vendas(@Query('inicio') inicio: string, @Query('fim') fim: string) {
    return this.relatoriosService.vendasPorPeriodo(
      new Date(inicio),
      new Date(fim),
    );
  }

  @Roles(Role.ADMIN)
  @Get('produtos-mais-vendidos')
  produtosMaisVendidos(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return this.relatoriosService.produtosMaisVendidos(
      new Date(inicio),
      new Date(fim),
    );
  }

  @Roles(Role.ADMIN)
  @Get('estoque-baixo')
  estoqueBaixo(@Query('limite') limite: string) {
    return this.relatoriosService.estoqueBaixo(Number(limite) || 5);
  }

  @Roles(Role.ADMIN)
  @Get('ordens')
  ordens() {
    return this.relatoriosService.ordensPorStatus();
  }
}
