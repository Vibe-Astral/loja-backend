import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class SignupDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role, { message: 'Role inválido' })
  role: Role;
}
