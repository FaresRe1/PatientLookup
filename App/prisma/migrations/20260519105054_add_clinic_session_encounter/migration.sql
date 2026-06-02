-- AlterTable
ALTER TABLE "Client" ADD COLUMN "village" TEXT;

-- CreateTable
CREATE TABLE "ClinicSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clinicName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "dailyTarget" INTEGER NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ClinicEncounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "bloodPressure" TEXT,
    "heartRate" TEXT,
    "temperature" TEXT,
    "spO2" TEXT,
    "weight" TEXT,
    "mainComplaint" TEXT,
    "medicalHistory" TEXT,
    "currentMedications" TEXT,
    "allergies" TEXT,
    "redFlags" TEXT,
    "examinationPerformed" TEXT,
    "examinationResults" TEXT,
    "diagnosis" TEXT,
    "clinicalNotes" TEXT,
    "treatmentAdvice" TEXT,
    "prescription" TEXT,
    "followUpAdvice" TEXT,
    "referral" BOOLEAN NOT NULL DEFAULT false,
    "medicationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "prescriberNotes" TEXT,
    "medicationGivenAt" DATETIME,
    "clientId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "ClinicEncounter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicEncounter_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClinicSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ClinicSession_date_idx" ON "ClinicSession"("date");

-- CreateIndex
CREATE INDEX "ClinicSession_isActive_idx" ON "ClinicSession"("isActive");

-- CreateIndex
CREATE INDEX "ClinicEncounter_status_idx" ON "ClinicEncounter"("status");

-- CreateIndex
CREATE INDEX "ClinicEncounter_sessionId_idx" ON "ClinicEncounter"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicEncounter_clientId_sessionId_key" ON "ClinicEncounter"("clientId", "sessionId");
