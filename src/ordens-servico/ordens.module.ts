import { Module } from '@nestjs/common';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OrdensController],
  providers: [OrdensService, PrismaService],
})
export class OrdensModule {}
