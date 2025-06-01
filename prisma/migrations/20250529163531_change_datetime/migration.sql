/*
  Warnings:

  - Changed the type of `work_timestamp` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "work_timestamp",
ADD COLUMN     "work_timestamp" TIMESTAMP(3) NOT NULL;
