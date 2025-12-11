/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_categoryId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "PaymentCategory" (
    "paymentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PaymentCategory_pkey" PRIMARY KEY ("paymentId","categoryId")
);

-- AddForeignKey
ALTER TABLE "PaymentCategory" ADD CONSTRAINT "PaymentCategory_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentCategory" ADD CONSTRAINT "PaymentCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
