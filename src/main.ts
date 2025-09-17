import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  // Testa conexão com banco
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco com sucesso");
  } catch (e) {
    console.error("❌ Erro ao conectar ao banco", e);
    process.exit(1);
  }

  // Cria app Nest
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log'],
  });

  // Pipes globais
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Configuração de CORS (local e produção)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
