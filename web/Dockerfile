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

ARG VERSION
ARG GIT_SHA
ARG BUILD_TIMESTAMP

ENV NEXT_PUBLIC_VERSION=$VERSION
ENV NEXT_PUBLIC_GIT_SHA=$GIT_SHA
ENV NEXT_PUBLIC_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

COPY package.json /tmp/package.root.json
COPY bot/package.json /tmp/package.bot.json
COPY web/package.json /tmp/package.web.json
RUN node scripts/generate-humans.js /tmp/package.web.json /tmp/package.bot.json /tmp/package.root.json
RUN SKIP_HUMANS_GENERATION=true npm run build

FROM node:20-bookworm-slim AS runner
RUN apt-get update -y && \
  apt-get install -y openssl curl --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

RUN adduser alphagamebot
USER alphagamebot

WORKDIR /app

RUN chown -R alphagamebot:alphagamebot /app
COPY --from=builder --chown=alphagamebot:alphagamebot /app/package.json ./package.json
COPY --from=builder --chown=alphagamebot:alphagamebot /app/node_modules ./node_modules
COPY --from=builder --chown=alphagamebot:alphagamebot /app/prisma ./prisma
COPY --from=builder --chown=alphagamebot:alphagamebot /app/.next ./.next
COPY --from=builder --chown=alphagamebot:alphagamebot /app/public ./public

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
