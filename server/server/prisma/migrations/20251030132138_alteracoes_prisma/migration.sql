/*
  Warnings:

  - The values [MAINTENANCE] on the enum `ChargeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `department` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `origin_id` on the `trip_requests` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `routes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[trip_request_id,sequence]` on the table `trip_waypoints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `start_address_id` to the `trip_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChargeType_new" AS ENUM ('FUEL', 'TOLL', 'PARKING', 'ACCOMMODATION', 'MEALS', 'CORRECTIVE_MAINTENANCE', 'PREVENTIVE_MAINTENANCE', 'OTHER');
ALTER TABLE "charges" ALTER COLUMN "type" TYPE "ChargeType_new" USING ("type"::text::"ChargeType_new");
ALTER TYPE "ChargeType" RENAME TO "ChargeType_old";
ALTER TYPE "ChargeType_new" RENAME TO "ChargeType";
DROP TYPE "public"."ChargeType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."routes" DROP CONSTRAINT "routes_trip_request_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."trip_requests" DROP CONSTRAINT "trip_requests_origin_id_fkey";

-- DropIndex
DROP INDEX "public"."trip_requests_requester_id_idx";

-- DropIndex
DROP INDEX "public"."trip_requests_status_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "department",
ADD COLUMN     "departmentId" UUID;

-- AlterTable
ALTER TABLE "trip_requests" DROP COLUMN "origin_id",
ADD COLUMN     "end_address_id" UUID,
ADD COLUMN     "is_self_driving" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proof_file" BYTEA,
ADD COLUMN     "proof_file_name" TEXT,
ADD COLUMN     "proof_mime_type" TEXT,
ADD COLUMN     "start_address_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "trip_waypoints" ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "department",
ADD COLUMN     "department_id" UUID;

-- DropTable
DROP TABLE "public"."routes";

-- DropEnum
DROP TYPE "public"."Department";

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "directions" JSONB,
    "trip_request_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_trip_request_id_key" ON "itineraries"("trip_request_id");

-- CreateIndex
CREATE INDEX "trip_requests_status_scheduled_departure_idx" ON "trip_requests"("status", "scheduled_departure");

-- CreateIndex
CREATE INDEX "trip_requests_requester_id_requested_at_idx" ON "trip_requests"("requester_id", "requested_at");

-- CreateIndex
CREATE INDEX "trip_waypoints_trip_request_id_sequence_idx" ON "trip_waypoints"("trip_request_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "trip_waypoints_trip_request_id_sequence_key" ON "trip_waypoints"("trip_request_id", "sequence");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_start_address_id_fkey" FOREIGN KEY ("start_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_end_address_id_fkey" FOREIGN KEY ("end_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_trip_request_id_fkey" FOREIGN KEY ("trip_request_id") REFERENCES "trip_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
