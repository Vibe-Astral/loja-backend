import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client'; // <-- enum do Prisma

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async signup(email: string, password: string, role: Role) {
    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hash, role },
    });

    return { id: user.id, email: user.email, role: user.role, filialId: user.filialId };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Usuário não encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Senha inválida');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      filialId: user.filialId, // ✅ incluímos filialId no token
    };

    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        filialId: user.filialId,
      },
    };
  }
}
