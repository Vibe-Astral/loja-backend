import { Module } from '@nestjs/common';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MovimentacaoModule } from '../movimentacao/movimentacao.module'; 

@Module({
  imports: [PrismaModule, MovimentacaoModule],
  controllers: [VendasController],
  providers: [VendasService],
})
export class VendasModule {}
