/*
  Warnings:

  - Changed the type of `work_timestamp` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `in_timestamp` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `out_timestamp` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "work_timestamp",
ADD COLUMN     "work_timestamp" INTEGER NOT NULL,
DROP COLUMN "in_timestamp",
ADD COLUMN     "in_timestamp" INTEGER NOT NULL,
DROP COLUMN "out_timestamp",
ADD COLUMN     "out_timestamp" INTEGER NOT NULL;
