import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FiliaisService {
  constructor(private prisma: PrismaService) { }

  async listarTodas() {
    return this.prisma.filial.findMany();
  }

  async buscarEstoqueDaFilial(filialId: string) {
    return this.prisma.estoque.findMany({
      where: { filialId },
      include: { produto: true },
    });
  }
  async criar(nome: string) {
    return this.prisma.filial.create({ data: { nome } });
  }

  async atualizar(id: string, nome: string) {
    return this.prisma.filial.update({
      where: { id },
      data: { nome },
    });
  }

  async remover(id: string) {
    return this.prisma.filial.delete({ where: { id } });
  }
}
