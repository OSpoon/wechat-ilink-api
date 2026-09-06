FROM node:24-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
  && corepack prepare pnpm@10.15.1 --activate

WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY admin/package.json admin/package.json
RUN pnpm install --frozen-lockfile --filter @wechat-ilink/admin --ignore-scripts

COPY admin admin
RUN pnpm --dir admin build

FROM nginx:1.29-alpine
COPY --from=build /workspace/admin/dist /usr/share/nginx/html
COPY deploy/admin.nginx.conf /etc/nginx/conf.d/default.conf
