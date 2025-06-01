-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "eid" INTEGER NOT NULL,
    "work_timestamp" TIMESTAMP(3) NOT NULL,
    "in_timestamp" TIMESTAMP(3) NOT NULL,
    "out_timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_key" ON "Employee"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_id_key" ON "Attendance"("id");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eid_fkey" FOREIGN KEY ("eid") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
