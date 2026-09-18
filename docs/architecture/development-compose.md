# Token 工厂开发 Compose 覆盖层

- 状态：源码构建通过，三服务开发环境已启动（2026-09-15）
- 基础：`docker-compose.yml`（上游原文件）
- 覆盖：`docker-compose.token-factory.dev.yml`
- 示例环境变量：`.env.token-factory.example`

## 目的

上游 Compose 使用固定的开发口令、容器名和本地目录挂载。本覆盖层不修改上游文件，而是将这些项目级配置改为环境变量和命名卷；真实本地值仅保存在被 Git 忽略的 `.env.token-factory` 中。

## 使用方式

1. 复制 `.env.token-factory.example` 为 `.env.token-factory`，并替换所有 `change-me` 值。
2. 使用以下两个 Compose 文件和该环境文件进行静态校验或启动：

   ```powershell
   docker compose --env-file .env.token-factory -f docker-compose.yml -f docker-compose.token-factory.dev.yml config
   ```

3. 启动前确认端口未被占用，且本机 Docker Desktop 已运行。

## 当前边界

- 此覆盖层仅编排上游 `new-api`、PostgreSQL 和 Redis。
- MinIO、CC-Switch、监控及预发三节点拓扑将在各自镜像、接口和安全边界核验后另行编排。
- 示例文件中的值是占位文本，不能作为部署或生产凭据。

## 源码构建与启动（2026-09-15）

开发覆盖层使用本地镜像 `token-factory-dev:69a50029819a`，通过仓库 Dockerfile 构建当前工作区。镜像标签记录上游基线，不代表工作区没有本地修改。Dockerfile 固定 Bun 1.4.0 和 Go 1.26.1 及镜像摘要，因此无需先在 Windows 宿主机安装 Go/Bun；宿主机原生工具链仍未安装。

在仓库根目录执行：

```powershell
docker compose --env-file .env.token-factory -f docker-compose.yml -f docker-compose.token-factory.dev.yml config --quiet
docker compose --env-file .env.token-factory -f docker-compose.yml -f docker-compose.token-factory.dev.yml --progress plain build
docker compose --env-file .env.token-factory -f docker-compose.yml -f docker-compose.token-factory.dev.yml up -d --no-build --wait --wait-timeout 180
docker compose --env-file .env.token-factory -f docker-compose.yml -f docker-compose.token-factory.dev.yml ps
Invoke-RestMethod http://127.0.0.1:13000/api/status
```

应用仅监听 `127.0.0.1:13000`，使用独立项目名、容器名及命名卷。`.dockerignore` 排除本地环境文件、凭据和运行目录。首次构建发现排除规则缺失后已中止，随后补齐规则并重新生成本地随机凭据。

本次使用 Docker Desktop 4.40.0、Engine 28.0.4、Compose 2.34.0 完成构建与启动。初次遇到审批服务容量不足、Debian 软件源 HTTP 502 和 npm 包解压失败；后续审批恢复，失败包重新下载并通过锁文件 SHA-512 校验，重试构建通过，未修改依赖版本或锁文件。

### 验证记录

2026-09-15，由 Codex 在本机开发环境执行：

| 检查 | 结果 |
| --- | --- |
| 容器工具链 | 实际执行 `bun --version` 为 1.4.0，`go version` 为 1.26.1 linux/amd64。 |
| 源码构建 | `bun install --frozen-lockfile`、`bun run build`、`go mod download`、`go build` 均成功，Compose build 退出码 0。 |
| 本地镜像 | `token-factory-dev:69a50029819a`；镜像 ID `sha256:49757dc46c59dfdeb8ee398a9739c2c357297099f304e40c08d19fa67fe47369`。 |
| 服务启动 | Compose `up --wait` 退出码 0；应用容器为 healthy，PostgreSQL 与 Redis 运行中。 |
| 数据库和缓存 | `pg_isready` 接受连接；Redis 认证后 PING 返回 PONG。 |
| HTTP | 首页返回 200；`GET /api/status` 返回 `success: true`。 |
| 初始化 | `GET /api/setup` 返回 `status: false`、`root_init: false`，等待首次创建管理员账号。 |

访问入口为 `http://127.0.0.1:13000`。按用户要求已停止旧容器 `new-api`（原端口 3000），确认状态为 exited；保留其数据库、缓存及数据卷。

上述结果仅证明源码可构建及基础开发服务可用；未执行单元测试、浏览器交互验收或真实模型请求主链路验证。PostgreSQL 三服务环境仍未覆盖 TF-107 的完整拓扑要求。

## 前端热更新开发（2026-09-15）

前端调整直接运行 Rsbuild 开发服务器，现有 Docker 后端继续提供 API。访问 `http://127.0.0.1:5173`，无需每次重建镜像或重启后端。

```powershell
Set-Location -LiteralPath C:\Projects\token-factory\web -ErrorAction Stop
$env:VITE_REACT_APP_SERVER_URL = 'http://127.0.0.1:13000'
.\node_modules\.bin\rsbuild.cmd dev --host 127.0.0.1 --port 5173
```

此命令复用已安装依赖。已配置 Bun 的终端也可使用 `bun run dev --host 127.0.0.1 --port 5173`。API 代理沿用 `rsbuild.config.ts` 的 `/api`、`/v1`、`/mj`、`/pg`，环境变量覆盖默认后端 `3000` 端口。开发服务仅绑定本机；Ctrl+C 结束前端服务。

本次核验：开发首页 HTTP 200，经 `5173` 代理访问 `/api/status` 返回 `success: true`；编辑组件后 HMR 生效。首次编译约 31 秒，后续观察到的增量编译约 0.7—1 秒（本机记录，不作为性能承诺）。Docker 镜像和运行中的后端未因本次前端修改重新构建或重启；`13000` 中的内嵌前端仍是旧构建，查看本轮修改请使用 `5173`。

## 独立前端发布镜像的依赖安装

`deploy/build-web-image.sh` 使用 `deploy/web.Dockerfile`，与根目录 Dockerfile、CI 对齐到固定 Bun 1.4.0 镜像及摘要。先复制 `web/package.json` 和 `web/bun.lock`，执行 `bun install --frozen-lockfile`，然后复制源码并运行 `bun run build`。锁文件缺失或与依赖声明不一致时直接失败，不回退到 npm 或自动更新依赖。依赖变更须同步提交 `web/bun.lock`。

保留 `NPM_REGISTRY` 构建参数用于指定 Bun 下载包的镜像源，默认 `https://registry.npmmirror.com/`；缓存仅加速下载，不改变锁定版本。冻结安装防止依赖版本漂移，但无法消除下载源不可用或锁定包缺失的问题；此时可以切换官方源，仍须保持冻结安装：

```bash
docker build -f deploy/web.Dockerfile \
  --build-arg NPM_REGISTRY=https://registry.npmjs.org/ \
  --build-arg VERSION="$(cat VERSION)" \
  -t new-api-web:lockcheck .
```

规则依据：[Bun 冻结安装说明](https://bun.sh/docs/pm/cli/install)。此调整不修改页面或 API 契约，也不会自动更新 ECS。

## 本轮提交与镜像构建方式

本轮提交包含门户逐段实现、品牌默认资源、回归测试及本地开发配置。未使用的 `web/public/figma/` 仅作本地参考，不加入本轮 Git 提交，并由 `.dockerignore` 排除，避免随静态资源发布。

构建使用仓库 Dockerfile 中固定的 Bun/Go 工具链。镜像以实际源码提交标记，同时设置 OCI revision 标签；`latest` 指向最近一次本地验收构建：

```powershell
Set-Location -LiteralPath C:\Projects\token-factory -ErrorAction Stop
$sourceRevision = git rev-parse HEAD
$sourceTag = git rev-parse --short=12 HEAD
docker build --progress=plain --label "org.opencontainers.image.revision=$sourceRevision" -t "token-factory-dev:$sourceTag" -t token-factory-dev:latest .
```

Compose 默认镜像为 `token-factory-dev:latest`，可通过环境变量 `TF_IMAGE=token-factory-dev:<提交哈希>` 固定版本。构建镜像不会自动替换运行中的容器；前端迭代继续访问 `5173`，需要实际部署该镜像时再执行单独的服务更新。

### 本轮镜像构建结果（2026-09-15）

- 源码提交：`5c1a4bea12a2440d216d906ff6400da9d5705990`（`fix(TF-103): 逐段实现可交互门户并完成本轮验收`）。
- 本轮收尾回归：4 个测试文件、27 项测试通过；类型检查、本轮修改文件 lint、格式及 Compose 静态检查通过。独立审查未发现 Critical / Important 问题；上游未修改组件的 lint 存量问题见[验收记录](../testing/v1-platform-foundation-acceptance.md)。
- 构建命令：`docker build --progress=plain --label org.opencontainers.image.revision=5c1a4bea12a2440d216d906ff6400da9d5705990 -t token-factory-dev:5c1a4bea12a2 -t token-factory-dev:latest .`，退出码 0。
- 标签：`token-factory-dev:5c1a4bea12a2`、`token-factory-dev:latest`。
- Docker inspect 返回的镜像 ID：`sha256:0548ab935e579a40ce8e3c2794523dd7fe8c23ac7042dc398c8e02414cce1e29`。
- 平台：`linux/amd64`；inspect 报告大小 `76611638` 字节；OCI revision 与上述源码提交完全一致。
- 构建阶段：冻结锁文件依赖层复用缓存；前端生产构建成功（约 10.9 秒）；Go 编译成功（约 56.9 秒）；最终镜像导出成功。以上为本次机器记录。
- 镜像检查：使用 `--rm --network none --read-only` 临时容器执行 `--help` 成功；确认 `/new-api` 可执行且 `/licenses/` 中 LICENSE、NOTICE、THIRD-PARTY-LICENSES.md 均存在且非空。未连接业务数据库或调用真实模型。
- 运行状态：未重启或替换现有容器，现有开发后端保持 healthy，前端热更新服务 `5173` 继续可用。构建结果仅在本机，未推送 Git 远程或镜像仓库。

本记录是源码提交后的构建凭据补充；文档提交不改变镜像所对应的源码 revision。
