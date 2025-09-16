import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FiliaisService {
  constructor(private prisma: PrismaService) {}

  async listarTodas() {
    return this.prisma.filial.findMany();
  }

  async buscarEstoqueDaFilial(filialId: string) {
    return this.prisma.estoque.findMany({
      where: { filialId },
      include: { produto: true },
    });
  }
}
