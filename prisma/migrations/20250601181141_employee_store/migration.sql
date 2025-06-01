/*
  Warnings:

  - Added the required column `store_id` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "store_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "store_name" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_id_key" ON "Store"("id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
