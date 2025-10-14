import { Module } from '@nestjs/common';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';
import { PrismaService } from '../prisma/prisma.service';
import { MovimentacaoService } from '../movimentacao/movimentacao.service';

@Module({
  controllers: [OrdensController],
  providers: [OrdensService, PrismaService,MovimentacaoService],
})
export class OrdensModule {}
