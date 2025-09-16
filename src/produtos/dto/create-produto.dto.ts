import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProdutoDto {
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  preco: number;

  @IsNotEmpty()
  fornecedor: string;

  @IsOptional()
  descricao?: string;

  @IsOptional()
  categoria?: string;
}
