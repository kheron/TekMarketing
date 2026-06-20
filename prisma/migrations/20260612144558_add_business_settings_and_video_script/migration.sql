-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_brand_context" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL,
    "voiceDescription" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "productsServices" TEXT NOT NULL,
    "keyDifferentiators" TEXT,
    "primaryGoals" TEXT NOT NULL,
    "contentPillars" TEXT,
    "preferredPlatforms" TEXT NOT NULL,
    "toneKeywords" TEXT,
    "doNotSay" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_brand_context" ("companyName", "contentPillars", "createdAt", "doNotSay", "id", "keyDifferentiators", "preferredPlatforms", "primaryGoals", "productsServices", "targetAudience", "toneKeywords", "updatedAt", "voiceDescription") SELECT "companyName", "contentPillars", "createdAt", "doNotSay", "id", "keyDifferentiators", "preferredPlatforms", "primaryGoals", "productsServices", "targetAudience", "toneKeywords", "updatedAt", "voiceDescription" FROM "brand_context";
DROP TABLE "brand_context";
ALTER TABLE "new_brand_context" RENAME TO "brand_context";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");
