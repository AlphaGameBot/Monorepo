# Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
# 
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

FROM node:20-bookworm AS builder
WORKDIR /app
COPY web/package*.json ./
COPY ./prisma ./prisma/
RUN npm install
COPY web .
COPY .git .git
COPY tsconfig.json tsconfig.base.json
COPY web/tsconfig.json tsconfig.json
RUN sed -i 's|"extends": *"[^"]*"|"extends": "./tsconfig.base.json"|' tsconfig.json

COPY package.json /tmp/package.root.json
COPY bot/package.json /tmp/package.bot.json
COPY web/package.json /tmp/package.web.json
RUN node scripts/generate-humans.js /tmp/package.web.json /tmp/package.bot.json /tmp/package.root.json
RUN SKIP_HUMANS_GENERATION=true npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update -y && \
  apt-get install -y openssl curl --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
  
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV NODE_ENV=production
ARG VERSION
ARG GIT_SHA
ARG BUILD_TIMESTAMP
ENV BUILD_TIMESTAMP=$BUILD_TIMESTAMP
ENV VERSION=$VERSION
ENV GIT_SHA=$GIT_SHA

HEALTHCHECK \
  --interval=30s \
  --timeout=10s \
  --start-period=20s \
  --retries=3 \
  CMD curl --fail --fail-with-body \
    --connect-timeout 2 \
    --max-time 5 \
    -H "User-Agent: AlphaGameBot-Healthcheck/$VERSION" \
    -H "X-AGB-Version: $VERSION" \
    -H "X-AGB-GitSHA: $GIT_SHA" \
    http://localhost:3000/healthcheck || exit 1
    
CMD ["npx", "next", "start", "-p", "3000"]
