-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('FAST', 'NORMAL', 'SLOW', 'DOWN', 'BLOCKED');

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "last_latency_ms" INTEGER,
    "last_status" "ServiceStatus",
    "last_http_code" INTEGER,
    "last_checked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_checks" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "ts" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency_ms" INTEGER,
    "status" "ServiceStatus" NOT NULL,
    "http_code" INTEGER,
    "error_text" TEXT,

    CONSTRAINT "service_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_url_key" ON "services"("url");

-- CreateIndex
CREATE INDEX "service_last_status" ON "services"("last_status");

-- CreateIndex
CREATE INDEX "service_last_checked" ON "services"("last_checked_at");

-- CreateIndex
CREATE INDEX "service_created_at" ON "services"("created_at");

-- CreateIndex
CREATE INDEX "service_check_service_ts" ON "service_checks"("service_id", "ts" DESC);

-- AddForeignKey
ALTER TABLE "service_checks" ADD CONSTRAINT "service_checks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;