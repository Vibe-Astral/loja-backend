// src/movimentacao/dto/criar-venda.dto.ts
import { IsUUID, IsInt, Min } from "class-validator";

export class CriarVendaDto {
  @IsUUID()
  consultorId: string; // 👈 quem realizou a venda

  @IsUUID()
  produtoId: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}
