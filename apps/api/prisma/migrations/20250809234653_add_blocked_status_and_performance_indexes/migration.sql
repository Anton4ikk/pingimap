-- AlterEnum
ALTER TYPE "public"."ServiceStatus" ADD VALUE 'BLOCKED';

-- CreateTable
CREATE TABLE "public"."service_checks" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "ts" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency_ms" INTEGER,
    "status" "public"."ServiceStatus" NOT NULL,
    "http_code" INTEGER,
    "error_text" TEXT,

    CONSTRAINT "service_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_check_service_ts" ON "public"."service_checks"("service_id", "ts" DESC);

-- CreateIndex
CREATE INDEX "service_last_status" ON "public"."services"("last_status");

-- CreateIndex
CREATE INDEX "service_last_checked" ON "public"."services"("last_checked_at");

-- CreateIndex
CREATE INDEX "service_created_at" ON "public"."services"("created_at");

-- AddForeignKey
ALTER TABLE "public"."service_checks" ADD CONSTRAINT "service_checks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
