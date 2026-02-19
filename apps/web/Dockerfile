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
RUN turbo prune @mio/web --docker

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
RUN yarn turbo build --filter=@mio/web

# ================================
# Production image
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
