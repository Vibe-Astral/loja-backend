// src/produtos/dto/create-produto.dto.ts
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EstoqueInicialDto {
  @IsString()
  filialId: string;

  @IsNumber()
  quantidade: number;
}

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsNumber()
  preco: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  fornecedor: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstoqueInicialDto)
  estoqueInicial?: EstoqueInicialDto[];
}
