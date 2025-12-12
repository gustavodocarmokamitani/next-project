-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripeAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- Step 1: Add organizationId to User as nullable first
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;

-- Step 2: Create organizations for admin users (users without manager or athlete)
-- Create one organization per admin user
INSERT INTO "Organization" ("id", "name", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    COALESCE(u."email", 'Organização ' || SUBSTRING(u."id"::text, 1, 8)),
    NOW(),
    NOW()
FROM "User" u
WHERE NOT EXISTS (
    SELECT 1 FROM "Manager" m WHERE m."userId" = u."id"
) AND NOT EXISTS (
    SELECT 1 FROM "Athlete" a WHERE a."userId" = u."id"
)
ON CONFLICT ("name") DO UPDATE SET "name" = "Organization"."name" || '_' || SUBSTRING(gen_random_uuid()::text, 1, 8);

-- Step 3: Link admin users to their organizations
UPDATE "User" u
SET "organizationId" = (
    SELECT o."id"
    FROM "Organization" o
    WHERE o."name" = COALESCE(u."email", 'Organização ' || SUBSTRING(u."id"::text, 1, 8))
    LIMIT 1
)
WHERE u."organizationId" IS NULL
AND NOT EXISTS (SELECT 1 FROM "Manager" m WHERE m."userId" = u."id")
AND NOT EXISTS (SELECT 1 FROM "Athlete" a WHERE a."userId" = u."id");

-- Create a default organization for non-admin users (managers and athletes)
INSERT INTO "Organization" ("id", "name", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'Organização Padrão',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "Organization" WHERE "name" = 'Organização Padrão'
);

-- Link remaining users (managers/athletes) to default organization
UPDATE "User" u
SET "organizationId" = (SELECT "id" FROM "Organization" WHERE "name" = 'Organização Padrão' LIMIT 1)
WHERE u."organizationId" IS NULL;

-- Step 4: Add foreign key constraint to User and make it unique
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "User_organizationId_key" ON "User"("organizationId") WHERE "organizationId" IS NOT NULL;

-- Step 5: Add organizationId to Category as nullable first
ALTER TABLE "Category" ADD COLUMN "organizationId" TEXT;

-- Link categories to their organization (use default for now)
UPDATE "Category" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "Category" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Category" ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old unique constraint and add new one
DROP INDEX IF EXISTS "Category_name_key";
CREATE UNIQUE INDEX "Category_name_organizationId_key" ON "Category"("name", "organizationId");

-- Step 6: Add organizationId to Manager as nullable first
ALTER TABLE "Manager" ADD COLUMN "organizationId" TEXT;

-- Link managers to their user's organization
UPDATE "Manager" m
SET "organizationId" = (
    SELECT u."organizationId"
    FROM "User" u
    WHERE u."id" = m."userId"
)
WHERE m."organizationId" IS NULL;

-- If still null, link to default organization
UPDATE "Manager" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "Manager" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add organizationId to Athlete as nullable first
ALTER TABLE "Athlete" ADD COLUMN "organizationId" TEXT;

-- Link athletes to their user's organization
UPDATE "Athlete" a
SET "organizationId" = (
    SELECT u."organizationId"
    FROM "User" u
    WHERE u."id" = a."userId"
)
WHERE a."organizationId" IS NULL;

-- If still null, link to default organization
UPDATE "Athlete" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "Athlete" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Add organizationId to Event as nullable first
ALTER TABLE "Event" ADD COLUMN "organizationId" TEXT;

-- Link events to default organization (we'll need to update this logic later)
UPDATE "Event" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "Event" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Add organizationId to ManagerInvite as nullable first
ALTER TABLE "ManagerInvite" ADD COLUMN "organizationId" TEXT;

-- Link manager invites to default organization
UPDATE "ManagerInvite" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "ManagerInvite" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "ManagerInvite" ADD CONSTRAINT "ManagerInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Add organizationId to AthleteInvite as nullable first
ALTER TABLE "AthleteInvite" ADD COLUMN "organizationId" TEXT;

-- Link athlete invites to default organization
UPDATE "AthleteInvite" 
SET "organizationId" = (SELECT "id" FROM "Organization" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Make organizationId required and add foreign key
ALTER TABLE "AthleteInvite" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "AthleteInvite" ADD CONSTRAINT "AthleteInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

