# ---- Builder stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first so this layer caches unless the lockfile changes
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Create the env file by copying the example
RUN cp .env.example .env.production.local

# NEXT_PUBLIC_* values are inlined into the bundle at build time, so they must
# be present before `yarn build`.
ARG BACKEND_URL
ARG BASE_URL
ARG TINY_KEY
ARG PADDLE_CLIENT_TOKEN
ARG PADDLE_ENV

RUN sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=\"$BACKEND_URL\"|" .env.production.local && \
    sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=\"$BASE_URL\"|" .env.production.local && \
    sed -i "s|NEXT_PUBLIC_TINY_MCE_KEY=.*|NEXT_PUBLIC_TINY_MCE_KEY=\"$TINY_KEY\"|" .env.production.local && \
    sed -i "s|NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=.*|NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=\"$PADDLE_CLIENT_TOKEN\"|" .env.production.local && \
    sed -i "s|NEXT_PUBLIC_PADDLE_ENV=.*|NEXT_PUBLIC_PADDLE_ENV=\"$PADDLE_ENV\"|" .env.production.local

# Produces .next/standalone (server + traced node_modules) and .next/static
RUN yarn build

# ---- Runner stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output bundles only what the server actually needs.
# .next/static and public are NOT included in standalone — copy them explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER 1001

EXPOSE 3000

# server.js is emitted by Next's standalone output
CMD ["node", "server.js"]
