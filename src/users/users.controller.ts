import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Roles(Role.ADMIN)
  @Get()
  async listarUsuarios() {
    return this.usersService.listarTodos();
  }

  @Roles(Role.ADMIN)
  @Post()
  async criarUsuario(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deletarUsuario(@Param('id') id: string) {
    return this.usersService.deletarUsuario(id);
  }

  // Qualquer usuário autenticado pode ver seu próprio perfil
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }
}
