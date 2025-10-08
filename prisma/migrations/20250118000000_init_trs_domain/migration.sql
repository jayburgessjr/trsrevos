-- Create Enums
CREATE TYPE "Role" AS ENUM ('SuperAdmin', 'Principal', 'Operator', 'Analyst', 'Viewer');
CREATE TYPE "TrsBand" AS ENUM ('RED', 'YELLOW', 'GREEN');
CREATE TYPE "DeliverableType" AS ENUM (
    'CLARITY_AUDIT',
    'GAP_MAP',
    'INTERVENTION_BLUEPRINT',
    'REVBOARD',
    'MONTHLY_ROI',
    'QUARTERLY_ROI',
    'CASE_STUDY_PACKET'
);
CREATE TYPE "DeliverableStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETE', 'BLOCKED');
CREATE TYPE "GovernanceStatus" AS ENUM ('OPEN', 'BLOCKED', 'APPROVED');
CREATE TYPE "DecisionRight" AS ENUM ('RECOMMEND', 'AUTO');

-- User & Auth tables
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'Viewer',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" ("provider", "providerAccountId");

CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" ("token");

-- Domain tables
CREATE TABLE "TrsAccount" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "tier" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "TrsScore" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "cac" DOUBLE PRECISION NOT NULL,
    "nrr" DOUBLE PRECISION NOT NULL,
    "churn" DOUBLE PRECISION NOT NULL,
    "payback" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "forecastMape" DOUBLE PRECISION NOT NULL,
    "velocity" DOUBLE PRECISION NOT NULL,
    "incidents" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "band" "TrsBand" NOT NULL,
    "drivers" JSONB NOT NULL,
    "computedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "TrsScore_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_trs_score_account_computed" ON "TrsScore" ("accountId", "computedAt");

CREATE TABLE "Deliverable" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DeliverableStatus" NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "lastReviewAt" TIMESTAMP WITH TIME ZONE,
    "exportLink" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Deliverable_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "GovernanceAction" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "GovernanceStatus" NOT NULL,
    "roiHypothesis" TEXT,
    "paybackWindowMonths" INTEGER,
    "trsLever" TEXT,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "GovernanceAction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Agent" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kpi" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "AgentBinding" (
    "id" TEXT PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "deliverableId" TEXT,
    "kpi" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "AgentBinding_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentBinding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentBinding_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_agent_binding_account" ON "AgentBinding" ("accountId");
CREATE UNIQUE INDEX "uq_agent_binding_agent_account_kpi" ON "AgentBinding" ("agentId", "accountId", "kpi");

CREATE TABLE "ModelCard" (
    "id" TEXT PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "f1Score" DOUBLE PRECISION,
    "forecastMape" DOUBLE PRECISION,
    "decisionRight" "DecisionRight" NOT NULL,
    "nextRetrainAt" TIMESTAMP WITH TIME ZONE,
    "approver" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "ModelCard_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelCard_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "uq_model_card_agent_account_version" ON "ModelCard" ("agentId", "accountId", "version");

CREATE TABLE "ContentItem" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "summary" TEXT,
    "metadata" JSONB,
    "lastIndexedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "ContentItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_content_account_last_indexed" ON "ContentItem" ("accountId", "lastIndexedAt");

CREATE TABLE "LastSync" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT,
    "integration" TEXT NOT NULL,
    "cursor" TEXT,
    "syncedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "LastSync_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TrsAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "uq_last_sync_integration" ON "LastSync" ("integration");
