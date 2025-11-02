/*
  Warnings:

  - You are about to drop the column `departmentId` on the `audit_logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_departmentId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "departmentId",
ADD COLUMN     "department_id" UUID;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "audit_logs_department_id_idx" ON "audit_logs"("department_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
