/*
  Warnings:

  - Added the required column `revenue` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "revenue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "role" INTEGER;
