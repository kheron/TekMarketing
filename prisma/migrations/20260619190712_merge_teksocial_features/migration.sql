-- AlterTable
ALTER TABLE "brand_context" ADD COLUMN "additionalContext" TEXT;
ALTER TABLE "brand_context" ADD COLUMN "industry" TEXT;
ALTER TABLE "brand_context" ADD COLUMN "logoDataUrl" TEXT;
ALTER TABLE "brand_context" ADD COLUMN "visualStyle" TEXT;
ALTER TABLE "brand_context" ADD COLUMN "website" TEXT;

-- CreateTable
CREATE TABLE "content_packages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandContextId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "platforms" JSONB NOT NULL,
    "strategyNote" TEXT NOT NULL,
    "agentReasoning" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_packages_brandContextId_fkey" FOREIGN KEY ("brandContextId") REFERENCES "brand_context" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "content_packages_brandContextId_createdAt_idx" ON "content_packages"("brandContextId", "createdAt");
