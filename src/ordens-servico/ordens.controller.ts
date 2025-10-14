import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query} from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ordens-servico')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async criar(@Req() req, @Body() dto: CreateOrdemDto) {
    const usuario = req.user;

    // Se o usuário for técnico e não informar técnicoId, ele próprio é o técnico
    const tecnicoId =
      dto.tecnicoId || (usuario.role === 'TECNICO' ? usuario.id : null);

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Req() req, @Query() query) {
    const usuario = req.user;
    const { status, tecnicoId } = query;

    const filtroBase: any = {};
    if (status) filtroBase.status = status;

    // técnico vê só as dele
    if (usuario.role === 'TECNICO') {
      filtroBase.tecnicoId = usuario.id;
    }
    // consultor/admin pode ver todas, ou filtrar por técnico
    else if (tecnicoId) {
      filtroBase.tecnicoId = tecnicoId;
    }

    return this.ordensService.listarComFiltro(filtroBase);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.ordensService.buscarPorId(id);
  }
}
