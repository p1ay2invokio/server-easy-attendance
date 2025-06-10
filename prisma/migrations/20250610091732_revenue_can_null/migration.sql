-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "revenue" DROP NOT NULL,
ALTER COLUMN "revenue" SET DEFAULT 0.00;
