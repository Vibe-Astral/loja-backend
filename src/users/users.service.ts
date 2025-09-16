import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        role: dto.role,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }
  async listarTodos() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }
  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }
  async criarUsuario(email: string, password: string, role: Role) {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hash, role },
    });
  }

  async deletarUsuario(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
