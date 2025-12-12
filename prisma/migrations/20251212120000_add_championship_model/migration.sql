-- CreateTable
CREATE TABLE "Championship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipCategory" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "allowUpgrade" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionshipCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipEntry" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "championshipCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionshipEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipAthleteEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionshipAthleteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipInvite" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChampionshipInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChampionshipInvite_token_key" ON "ChampionshipInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionshipEntry_championshipId_organizationId_championshipCategoryId_key" ON "ChampionshipEntry"("championshipId", "organizationId", "championshipCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionshipAthleteEntry_entryId_athleteId_key" ON "ChampionshipAthleteEntry"("entryId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionshipInvite_championshipId_organizationId_key" ON "ChampionshipInvite"("championshipId", "organizationId");

-- AddForeignKey
ALTER TABLE "Championship" ADD CONSTRAINT "Championship_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipCategory" ADD CONSTRAINT "ChampionshipCategory_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipCategory" ADD CONSTRAINT "ChampionshipCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipEntry" ADD CONSTRAINT "ChampionshipEntry_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipEntry" ADD CONSTRAINT "ChampionshipEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipEntry" ADD CONSTRAINT "ChampionshipEntry_championshipCategoryId_fkey" FOREIGN KEY ("championshipCategoryId") REFERENCES "ChampionshipCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipAthleteEntry" ADD CONSTRAINT "ChampionshipAthleteEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ChampionshipEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipAthleteEntry" ADD CONSTRAINT "ChampionshipAthleteEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipInvite" ADD CONSTRAINT "ChampionshipInvite_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipInvite" ADD CONSTRAINT "ChampionshipInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

