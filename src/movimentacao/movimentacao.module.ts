import { Module } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { MovimentacaoController } from './movimentacao.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EstoqueController } from '../estoque/estoque.controller'; // se você colocou lá

@Module({
  imports: [PrismaModule],
  controllers: [MovimentacaoController, EstoqueController],
  providers: [MovimentacaoService, PrismaService],
  exports: [MovimentacaoService],
})
export class MovimentacaoModule {}
