-- 2025-11-04T16-17-55 initial
-- One DDL per statement (DSQL).
-- No transactions, no PL/pgSQL, no sequences.

DROP TABLE IF EXISTS "contact_submissions";
CREATE TABLE "contact_submissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- Portfolio
DROP TABLE IF EXISTS "portfolios";
CREATE TABLE "portfolios" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "portfolio_categories";
CREATE TABLE "portfolio_categories" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "portfolio_categories_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "categories_on_portfolios";
CREATE TABLE "categories_on_portfolios" (
    "portfolioId" UUID NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_on_portfolios_pkey" PRIMARY KEY ("portfolioId","categoryId")
);

CREATE INDEX ASYNC "categories_on_portfolios_categoryId_portfolioId_idx" ON "categories_on_portfolios"("categoryId", "portfolioId");

-- Blog
DROP TABLE IF EXISTS "blogs";
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "blog_categories";
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "categories_on_blogs";
CREATE TABLE "categories_on_blogs" (
    "blogId" UUID NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_on_blogs_pkey" PRIMARY KEY ("blogId","categoryId")
);

CREATE INDEX ASYNC "categories_on_blogs_categoryId_blogId_idx" ON "categories_on_blogs"("categoryId", "blogId");
