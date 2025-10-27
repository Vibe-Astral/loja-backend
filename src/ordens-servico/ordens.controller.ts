import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ordens-servico')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async criar(@Req() req, @Body() dto: CreateOrdemDto) {
    const usuario = req.user;
    // Se o usuário for técnico e não informar técnicoId, ele próprio é o técnico
    const tecnicoId = dto.tecnicoId || (usuario.role === 'TECNICO' ? usuario.id : null);

    return this.ordensService.criarOrdem({
      ...dto,
      tecnicoId,
    });
  }

  @Post('item')
  adicionarItem(@Body() dto: AddItemDto) {
    return this.ordensService.adicionarItem(dto);
  }

  @Patch('status')
  atualizarStatus(@Body() dto: UpdateStatusDto) {
    return this.ordensService.atualizarStatus(dto);
  }
  @Post(':id/assumir')
  async assumir(@Param('id') id: string, @Req() req) {
    const tecnicoId = req.user.id;
    return this.ordensService.assumirOrdem(id, tecnicoId);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Req() req, @Query() query) {
    const usuario = req.user;
    const { status, tecnicoId } = query;

    const filtroBase: any = {};
    if (status) filtroBase.status = status;

    // técnico vê só as dele
    if (usuario.role === 'TECNICO') {
      filtroBase.OR = [
        { tecnicoId: usuario.id },
        { tecnicoId: null, status: 'ABERTA' }, // 👈 inclui abertas
      ];
    } else if (tecnicoId) {
      filtroBase.tecnicoId = tecnicoId;
    }
    return this.ordensService.listarComFiltro(filtroBase);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.ordensService.buscarPorId(id);
  }
  // 🔄 Reabrir O.S. (ADMIN)
  @Roles(Role.ADMIN)
  @Post(':id/reabrir')
  async reabrir(@Param('id') id: string) {
    return this.ordensService.reabrirOrdem(id);
  }
}
