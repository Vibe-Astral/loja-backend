import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CriarEntradaDto {
  @IsUUID()
  @IsNotEmpty()
  produtoId: string;

  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @IsUUID()
  @IsOptional()
  destinoFilialId?: string;

  @IsUUID()
  @IsOptional()
  destinoTecnicoId?: string;
}

export class CriarSaidaDto {
  @IsUUID()
  @IsNotEmpty()
  produtoId: string;

  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @IsUUID()
  @IsOptional()
  origemFilialId?: string;

  @IsUUID()
  @IsOptional()
  origemTecnicoId?: string;
}

export class CriarTransferenciaDto {
  @IsUUID()
  @IsNotEmpty()
  produtoId: string;

  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @IsUUID()
  @IsOptional()
  origemFilialId?: string;

  @IsUUID()
  @IsOptional()
  origemTecnicoId?: string;

  @IsUUID()
  @IsOptional()
  destinoFilialId?: string;

  @IsUUID()
  @IsOptional()
  destinoTecnicoId?: string;
}
