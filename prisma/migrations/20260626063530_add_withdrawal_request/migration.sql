-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "revenue" DROP DEFAULT;

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" SERIAL NOT NULL,
    "eid" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_id_key" ON "WithdrawalRequest"("id");

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_eid_fkey" FOREIGN KEY ("eid") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
