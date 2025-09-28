// src/filiais/filiais.module.ts
import { Module } from '@nestjs/common';
import { FiliaisController } from './filiais.controller';
import { FiliaisService } from './filiais.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [FiliaisController],
  providers: [FiliaisService, PrismaService],
})
export class FiliaisModule {}
