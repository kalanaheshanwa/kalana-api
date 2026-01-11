-- 2026-01-11T13-59-27 portfolio_upgrade
-- One DDL per statement (DSQL).
-- No transactions, no PL/pgSQL, no sequences.

DROP TABLE IF EXISTS "portfolios";
CREATE TABLE "portfolios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "canonical" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "thumbnail" TEXT NOT NULL,
    "summary" TEXT NOT NULL, -- Overview
    "body" TEXT NOT NULL, -- Solution
    "coverImage" TEXT NOT NULL,
    "imagesJson" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "durationDays" SMALLINT NOT NULL,
    "technologiesJson" TEXT NOT NULL,
    "deliveredItemsJson" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);
