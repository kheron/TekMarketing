-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'xai',
    "model" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "estimatedCostUsd" REAL,
    "relatedContentId" TEXT,
    "relatedAgentRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "api_usage_logs_createdAt_idx" ON "api_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_usage_logs_purpose_idx" ON "api_usage_logs"("purpose");
