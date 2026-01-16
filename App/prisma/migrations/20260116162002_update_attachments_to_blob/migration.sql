/*
  Warnings:

  - You are about to drop the column `filePath` on the `VisitAttachment` table. All the data in the column will be lost.
  - Added the required column `fileData` to the `VisitAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VisitAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileData" BLOB NOT NULL,
    "fileSize" INTEGER NOT NULL,
    CONSTRAINT "VisitAttachment_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VisitAttachment" ("createdAt", "fileName", "fileSize", "fileType", "id", "visitId") SELECT "createdAt", "fileName", "fileSize", "fileType", "id", "visitId" FROM "VisitAttachment";
DROP TABLE "VisitAttachment";
ALTER TABLE "new_VisitAttachment" RENAME TO "VisitAttachment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
