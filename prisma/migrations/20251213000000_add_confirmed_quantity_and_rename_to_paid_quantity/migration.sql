-- Step 1: Add new columns
ALTER TABLE "AthletePaymentItem" ADD COLUMN "confirmedQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AthletePaymentItem" ADD COLUMN "paidQuantity" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrate existing data
-- Copy quantity to both confirmedQuantity and paidQuantity for existing records
UPDATE "AthletePaymentItem" 
SET 
  "confirmedQuantity" = "quantity",
  "paidQuantity" = CASE WHEN "paid" = true THEN "quantity" ELSE 0 END
WHERE "quantity" IS NOT NULL;

-- Step 3: Drop the old quantity column
ALTER TABLE "AthletePaymentItem" DROP COLUMN "quantity";

