# =========================================================================
# acbolsa — imagem de produção
# =========================================================================
#
# Build:
#   docker build \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx \
#     --build-arg EXTERNAL_CHECKOUT_BASE_URL=https://checkout.exemplo/... \
#     -t acbolsa .
#
# Run:
#   docker run -p 3000:3000 acbolsa
#
# As NEXT_PUBLIC_* são embutidas no bundle EM BUILD — por isso entram como
# --build-arg, não como -e no run.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG EXTERNAL_CHECKOUT_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV EXTERNAL_CHECKOUT_BASE_URL=$EXTERNAL_CHECKOUT_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` (next.config.mjs) gera .next/standalone com só o que
# `node server.js` precisa.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
