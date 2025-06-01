-- AlterTable
CREATE SEQUENCE employee_id_seq;
ALTER TABLE "Employee" ALTER COLUMN "id" SET DEFAULT nextval('employee_id_seq');
ALTER SEQUENCE employee_id_seq OWNED BY "Employee"."id";
