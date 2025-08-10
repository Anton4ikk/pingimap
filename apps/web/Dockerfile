FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/web/ ./apps/web/
RUN pnpm --filter=@pingimap/web build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY --from=builder --chown=sveltekit:nodejs /app/apps/web/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/apps/web/package.json ./package.json
COPY --from=deps --chown=sveltekit:nodejs /app/node_modules ./node_modules

USER sveltekit

EXPOSE 3000

CMD ["node", "build"]