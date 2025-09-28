import { Module } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { MovimentacaoController } from './movimentacao.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MovimentacaoController],
  providers: [MovimentacaoService, PrismaService],
  exports: [MovimentacaoService],
})
export class MovimentacaoModule {}
