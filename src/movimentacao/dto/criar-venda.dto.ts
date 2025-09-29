// src/movimentacao/dto/criar-venda.dto.ts
import { IsUUID, IsInt, Min } from "class-validator";

export class CriarVendaDto {
  @IsUUID()
  produtoId: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}
