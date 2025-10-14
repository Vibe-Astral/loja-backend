import { Status } from '@prisma/client';

export class UpdateStatusDto {
  ordemId: string;
  status: Status;
}
