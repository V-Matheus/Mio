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
# The API workspace postinstall runs Prisma generate, which needs the schemas
# even in this dependency-only layer. Copy only schemas to preserve dependency
# layer caching when application source files change.
COPY --from=pruner /app/out/full/apps/api/apps/core/prisma/schema.prisma ./apps/api/apps/core/prisma/schema.prisma
COPY --from=pruner /app/out/full/apps/api/apps/gamification/prisma/schema.prisma ./apps/api/apps/gamification/prisma/schema.prisma
COPY --from=pruner /app/out/full/apps/api/apps/achievements/prisma/schema.prisma ./apps/api/apps/achievements/prisma/schema.prisma
RUN yarn install --frozen-lockfile

# ================================
# Build the application
# ================================
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=pruner /app/out/json/yarn.lock ./yarn.lock
COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=@mio/api
RUN for service in gateway core gamification achievements messenger notifications; do \
      test -f "apps/api/dist/apps/${service}/apps/${service}/src/main.js" || exit 1; \
    done

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
# Yarn scripts run from the API workspace and resolve Prisma through this local .bin directory.
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/node_modules/.bin ./apps/api/node_modules/.bin
COPY --from=builder --chown=nestjs:nodejs /app/packages/grpc-contracts/package.json ./packages/grpc-contracts/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/grpc-contracts/dist ./packages/grpc-contracts/dist
USER nestjs

ARG SERVICE=gateway
ENV SERVICE=${SERVICE}

EXPOSE 3333

COPY --chown=nestjs:nodejs apps/api/healthcheck-grpc.cjs ./apps/api/healthcheck-grpc.cjs

CMD ["sh", "-c", "exec node apps/api/dist/apps/${SERVICE}/apps/${SERVICE}/src/main.js"]

# ================================
# One-shot Prisma migration image
# ================================
FROM node:24-alpine AS migrator
WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_HOME=/opt/corepack

RUN mkdir -p /opt/corepack && corepack enable && corepack prepare yarn@1.22.22 --activate
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 migrator

COPY --from=installer --chown=migrator:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=migrator:nodejs /app/apps/api/node_modules/.bin ./apps/api/node_modules/.bin
COPY --from=pruner --chown=migrator:nodejs /app/out/full/apps/api/package.json ./apps/api/package.json
COPY --from=pruner --chown=migrator:nodejs /app/out/full/apps/api/apps/core/prisma ./apps/api/apps/core/prisma
COPY --from=pruner --chown=migrator:nodejs /app/out/full/apps/api/apps/gamification/prisma ./apps/api/apps/gamification/prisma
COPY --from=pruner --chown=migrator:nodejs /app/out/full/apps/api/apps/achievements/prisma ./apps/api/apps/achievements/prisma

USER migrator
WORKDIR /app/apps/api

CMD ["yarn", "prisma:migrate:deploy"]
