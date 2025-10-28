/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `contact_person` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subtask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_client_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subtask" DROP CONSTRAINT "Subtask_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subtask" DROP CONSTRAINT "Subtask_task_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_project_id_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "address",
DROP COLUMN "contact_person",
DROP COLUMN "email",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."Project";

-- DropTable
DROP TABLE "public"."Subtask";

-- DropTable
DROP TABLE "public"."Task";

-- DropEnum
DROP TYPE "public"."ProjectStatus";

-- DropEnum
DROP TYPE "public"."TaskStatus";
