# ================================
# Base image
# ================================
FROM node:22-alpine AS base
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
COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=@mio/api

# ================================
# Production image
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3333

CMD ["node", "dist/main.js"]
