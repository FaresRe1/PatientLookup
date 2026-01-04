/*
  Warnings:

  - You are about to drop the column `notes` on the `Client` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorName" TEXT NOT NULL,
    "notes" TEXT,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "structure" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VisitForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    CONSTRAINT "VisitForm_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VisitForm_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" DATETIME,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "deletedAt" DATETIME,
    "lastModified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revision" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Client" ("address", "createdAt", "deletedAt", "email", "fullName", "id", "lastModified", "phoneNumber", "revision", "updatedAt") SELECT "address", "createdAt", "deletedAt", "email", "fullName", "id", "lastModified", "phoneNumber", "revision", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE INDEX "Client_fullName_idx" ON "Client"("fullName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
