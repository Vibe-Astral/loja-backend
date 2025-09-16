import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: {
        nome: dto.nome,
        preco: dto.preco,
        fornecedor: dto.fornecedor,
        descricao: dto.descricao,
        categoria: dto.categoria,
        estoque: {
          create: {
            quantidade: 0,
          },
        },
      },
      include: { estoque: true },
    });
  }
  async update(id: string, dto: CreateProdutoDto) {
    return this.prisma.produto.update({
      where: { id },
      data: {
        nome: dto.nome,
        preco: dto.preco,
        fornecedor: dto.fornecedor,
        descricao: dto.descricao,
        categoria: dto.categoria,
      },
    });
  }


  async findAll() {
    return this.prisma.produto.findMany();
  }

  async findOne(id: string) {
    return this.prisma.produto.findUnique({ where: { id } });
  }

  async delete(id: string) {
    const vinculos = await this.prisma.estoque.findFirst({ where: { produtoId: id } });
    if (vinculos) {
      throw new Error("Produto não pode ser deletado porque está em uso no estoque.");
    }

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
