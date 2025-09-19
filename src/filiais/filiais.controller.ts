import { Controller, Get, Post, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { FiliaisService } from './filiais.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('filiais')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FiliaisController {
  constructor(private readonly filiaisService: FiliaisService) { }

  @Get()
  async listarTodas() {
    return this.filiaisService.listarTodas();
  }

  @Get(':id/estoque')
  async getEstoqueDaFilial(@Param('id') id: string) {
    return this.filiaisService.buscarEstoqueDaFilial(id);
  }
  @Post()
  async criar(@Body() dto: { nome: string }) {
    return this.filiaisService.criar(dto.nome);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: { nome: string }) {
    return this.filiaisService.atualizar(id, dto.nome);
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    return this.filiaisService.remover(id);
  }
}
