-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorName" TEXT NOT NULL,
    "presentingComplaint" TEXT NOT NULL DEFAULT '',
    "historyOfPresentingComplaint" TEXT NOT NULL DEFAULT '',
    "observationAndExamination" TEXT NOT NULL DEFAULT '',
    "impression" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("clientId", "createdAt", "doctorName", "id", "notes", "visitDate") SELECT "clientId", "createdAt", "doctorName", "id", "notes", "visitDate" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
