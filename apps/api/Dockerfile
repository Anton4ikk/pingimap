FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY apps/api/ ./apps/api/
RUN pnpm --filter @pingimap/api exec prisma generate
RUN pnpm --filter=@pingimap/api build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy workspace files needed for dependency resolution
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json

# Install all dependencies (including dev dependencies for tsx)
RUN pnpm --filter=@pingimap/api install --frozen-lockfile

COPY --from=builder --chown=fastify:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=fastify:nodejs /app/apps/api/src/generated ./apps/api/dist/generated

# Copy Prisma schema and migrations
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy seeding script
COPY scripts/seed-services.ts ./scripts/seed-services.ts

# Copy wait-for script and migration script
COPY scripts/wait-for.sh /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

# Create a startup script
RUN printf '#!/bin/sh\ncd apps/api\nnpx prisma db push\nnode dist/server.js\n' > /usr/local/bin/start-api.sh
RUN chmod +x /usr/local/bin/start-api.sh

# Change ownership of the app directory to fastify user
RUN chown -R fastify:nodejs /app

USER fastify

EXPOSE 3001

CMD ["wait-for", "postgres:5432", "--", "wait-for", "nats:4222", "--", "/usr/local/bin/start-api.sh"]