-- CreateTable
CREATE TABLE "brand_context" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "suggestedMedia" TEXT,
    "scheduledFor" DATETIME,
    "agentReasoning" TEXT,
    "confidence" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "humanFeedback" TEXT,
    "publishedAt" DATETIME,
    "performance" JSONB,
    "createdBy" TEXT NOT NULL DEFAULT 'agent',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "contentItemId" TEXT,
    "agentRunId" TEXT,
    CONSTRAINT "activity_logs_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activity_logs_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "agent_runs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "trigger" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "contextSnapshot" JSONB,
    "goals" JSONB,
    "proposals" JSONB,
    "summary" TEXT
);

-- CreateIndex
CREATE INDEX "content_items_status_scheduledFor_idx" ON "content_items"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "content_items_platform_status_idx" ON "content_items"("platform", "status");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "agent_runs_startedAt_idx" ON "agent_runs"("startedAt");
