import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateProdutoDto) {
    return this.prisma.$transaction(async (tx) => {
      // cria o produto global
      const produto = await tx.produto.create({
        data: {
          nome: dto.nome,
          preco: dto.preco,
          descricao: dto.descricao,
          fornecedor: dto.fornecedor,
          categoria: dto.categoria,
        },
      });

      // cria estoque inicial, se vier no payload
      if (dto.estoqueInicial && dto.estoqueInicial.length > 0) {
        for (const e of dto.estoqueInicial) {
          await tx.estoque.create({
            data: {
              produtoId: produto.id,
              filialId: e.filialId,
              quantidade: e.quantidade,
            },
          });
        }
      }

      return produto;
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
