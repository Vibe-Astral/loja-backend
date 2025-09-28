import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

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
        filialId: dto.filialId ?? null,
      },
      include: { filial: true }, // 👈 carrega filial junto
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      filial: user.filial, // 👈 retorna o objeto filial
    };
  }
  // src/users/users.service.ts
  async atualizarFilial(id: string, filialId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { filialId },
      include: { filial: true },
    });
  }

  async listarTodos() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        filial: { select: { id: true, nome: true } }, // 👈 novo
      },
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

  async update(id: string, dto: UpdateUserDto) {
    let data: any = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10); // 👈 hash no reset
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { filial: true },
    });

    return { id: user.id, email: user.email, role: user.role, filial: user.filial };
  }
  async findAllClientes() {
    return this.prisma.user.findMany({
      where: { role: 'CLIENTE' },
      select: {
        id: true,
        email: true,
        nome: true,
      },
    });
  }



}
