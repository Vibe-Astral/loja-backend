import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'debug', 'log'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: 'http://localhost:5173', // libera só seu front local
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
