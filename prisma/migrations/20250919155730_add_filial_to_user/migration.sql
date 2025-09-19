-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "filialId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "public"."Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
