import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('ordens-servico')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post()
  criar(@Body() dto: CreateOrdemDto) {
    return this.ordensService.criarOrdem(dto);
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
  listar() {
    return this.ordensService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.ordensService.buscarPorId(id);
  }
}
