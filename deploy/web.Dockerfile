# new-api 前端镜像：用 Bun 编译 web/ 下的页面，用 nginx 托管静态文件并把后端路径反向代理到 server 容器。
# 构建上下文必须是仓库根目录：docker build -f deploy/web.Dockerfile -t new-api-web:<tag> .

# 与根目录 Dockerfile 和 CI 使用相同的固定 Bun 版本。
FROM oven/bun:1.4.0@sha256:5ff609364c049b54eb0ff560ec96319729a972078ef2c755d758f0c6ef89c2d6 AS builder
# 国内网络默认走 npmmirror；海外构建可传 --build-arg NPM_REGISTRY=https://registry.npmjs.org/
ARG NPM_REGISTRY=https://registry.npmmirror.com/
# 页面里显示的版本号，由构建脚本传入
ARG VERSION=dev

WORKDIR /build/web
COPY web/package.json web/bun.lock ./
# 严格使用锁定版本；锁文件缺失或与 package.json 不一致时构建失败。
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --registry "${NPM_REGISTRY}"
COPY web ./
RUN DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=${VERSION} bun run build

FROM nginx:1.27-alpine
COPY --from=builder /build/web/dist /usr/share/nginx/html
# 官方 nginx 镜像启动时会用 envsubst 渲染 templates/*.template 到 conf.d/，
# 所以后端地址可以用环境变量 SERVER_UPSTREAM 指定，默认 server:3000
COPY deploy/web.nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/web.nginx.proxy.inc      /etc/nginx/templates/proxy.inc.template
ENV SERVER_UPSTREAM=server:3000
EXPOSE 80
