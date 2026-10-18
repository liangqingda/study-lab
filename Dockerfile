# 单容器生产镜像：整仓构建前端 + API，运行时由 API 一并托管前端静态资源与 /api。
# 用于 Railway 等云平台。构建期需要 GitHub Packages 只读 token 安装私有
# @liangqingda/* 配置包：在平台设置构建变量 NPM_TOKEN（read:packages 权限）。

# ---- Build stage ----
FROM node:22-bookworm-slim AS build

# 私有配置包 @liangqingda/* 的 npm 认证（GitHub Packages）。
# Railway：在 Service → Variables 提供 NPM_TOKEN 作为构建变量即可。
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN

RUN corepack enable && corepack prepare pnpm@10.6.1 --activate

WORKDIR /workspace
COPY . .

RUN if [ -n "$NPM_TOKEN" ]; then \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > /root/.npmrc; \
    fi \
    && pnpm install --frozen-lockfile \
    && pnpm build

# ---- Runtime stage ----
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build --chown=node:node /workspace /workspace
USER node
WORKDIR /workspace/apps/api
EXPOSE 3000
CMD ["node", "--enable-source-maps", "build/index.js"]
