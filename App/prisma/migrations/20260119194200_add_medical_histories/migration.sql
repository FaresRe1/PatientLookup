-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" DATETIME NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "profileImage" BLOB,
    "drugHistory" TEXT NOT NULL DEFAULT '',
    "familyHistory" TEXT NOT NULL DEFAULT '',
    "socialHistory" TEXT NOT NULL DEFAULT '',
    "deletedAt" DATETIME,
    "lastModified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revision" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Client" ("address", "createdAt", "deletedAt", "dob", "email", "fullName", "gender", "id", "lastModified", "phoneNumber", "profileImage", "revision", "updatedAt") SELECT "address", "createdAt", "deletedAt", "dob", "email", "fullName", "gender", "id", "lastModified", "phoneNumber", "profileImage", "revision", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE INDEX "Client_fullName_idx" ON "Client"("fullName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
