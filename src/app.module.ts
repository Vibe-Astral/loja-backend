import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { EstoqueModule } from './estoque/estoque.module';
import { MovimentacaoModule } from './movimentacao/movimentacao.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { FiliaisModule } from './filiais/filiais.module';
import { VendasModule } from './vendas/vendas.module';

@Module({
  imports: [AuthModule, UsersModule, EstoqueModule, MovimentacaoModule, PedidosModule, ProdutosModule, FiliaisModule, VendasModule],
  providers: [PrismaService],
})
export class AppModule {}
