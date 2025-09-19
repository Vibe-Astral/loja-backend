import { Controller, Post, Body, Get, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('produtos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) { }

  @Roles(Role.ADMIN, Role.ESTOQUISTA)
  @Post()
  async criarProduto(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Get()
  async listarProdutos() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.produtosService.delete(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CreateProdutoDto) {
    return this.produtosService.update(id, dto);
  }

}
