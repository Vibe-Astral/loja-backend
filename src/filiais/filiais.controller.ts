import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FiliaisService } from './filiais.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('filiais')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FiliaisController {
  constructor(private readonly filiaisService: FiliaisService) {}

  @Get()
  async listarTodas() {
    return this.filiaisService.listarTodas();
  }

  @Get(':id/estoque')
  async getEstoqueDaFilial(@Param('id') id: string) {
    return this.filiaisService.buscarEstoqueDaFilial(id);
  }
}
