# ================================
# Base image
# ================================
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
WORKDIR /app

# ================================
# Prune dependencies
# ================================
FROM base AS pruner
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune @mio/api --docker

# ================================
# Install dependencies
# ================================
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN yarn install --frozen-lockfile

# ================================
# Build the application
# ================================
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=@mio/api

# ================================
# Production image
# ================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_HOME=/opt/corepack

RUN mkdir -p /opt/corepack && corepack enable && corepack prepare yarn@1.22.22 --activate
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/apps/core/prisma ./apps/api/apps/core/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/apps/gamification/prisma ./apps/api/apps/gamification/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/apps/achievements/prisma ./apps/api/apps/achievements/prisma

USER nestjs

ARG SERVICE=gateway
ENV SERVICE=${SERVICE}

EXPOSE 3333

CMD ["sh", "-c", "node apps/api/dist/apps/${SERVICE}/main.js"]
