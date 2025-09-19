// src/users/dto/update-user.dto.ts
import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string; // 👈 usado para resetar senha

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  filialId?: string;
}
