FROM node:24-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN node ace build && CI=true pnpm prune --prod --ignore-scripts

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app/build ./
COPY --from=build /app/node_modules ./node_modules

RUN mkdir -p /app/data /app/data/media \
  && chown -R node:node /app

USER node

EXPOSE 13333

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:13333/health/live').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "node ace.js migration:run --force && node bin/server.js"]
