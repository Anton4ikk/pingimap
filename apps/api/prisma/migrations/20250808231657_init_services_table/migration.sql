-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('UP', 'SLOW', 'DOWN');

-- CreateTable
CREATE TABLE "public"."services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "last_latency_ms" INTEGER,
    "last_status" "public"."ServiceStatus",
    "last_checked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_url_key" ON "public"."services"("url");
