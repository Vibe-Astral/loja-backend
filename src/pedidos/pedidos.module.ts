import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EstoqueModule } from '../estoque/estoque.module'; // 👈 importar

@Module({
  imports: [EstoqueModule], // 👈 necessário para injeção
  providers: [PedidosService, PrismaService],
  controllers: [PedidosController],
})
export class PedidosModule {}
