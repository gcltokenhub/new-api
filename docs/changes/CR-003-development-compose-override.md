# CR-003：Token 工厂开发 Compose 覆盖层

- 状态：已配置，静态校验通过
- 日期：2026-09-15
- 关联文档：[开发 Compose 覆盖层](../architecture/development-compose.md)

## 决策

保留上游 `docker-compose.yml` 原文件，新增 `docker-compose.token-factory.dev.yml` 与 `.env.token-factory.example`。启动或校验时必须同时使用基础文件和覆盖文件；真实本地配置使用被 Git 忽略的 `.env.token-factory`。

## 处理内容

- 替换上游固定的 PostgreSQL、Redis、会话和加密配置来源，改为环境变量。
- 使用命名卷替代上游绑定的 `data` 与 `logs` 目录。
- 使用 `!override` 替换而非追加端口列表，默认仅暴露 `13000:3000`。
- 为容器、项目名和节点名提供 Token 工厂开发环境命名。

## 验证

使用 Docker Compose 的 `config` 命令与示例环境文件完成静态校验：未发现上游固定默认口令；仅保留配置的 HTTP 端口；命名卷、会话密钥与加密密钥均出现在最终配置中。未拉取镜像、创建容器或执行服务启动。

上游基础文件仍含已弃用的 Compose `version` 字段，Docker Compose 将其忽略并发出警告；本变更不修改上游源码快照。

## 2026-09-15 构建准备补充

开发覆盖层改为构建当前工作区的本地镜像，使用上游 Dockerfile 中固定的 Go/Bun 工具链；HTTP 端口仅绑定回环地址。补充 `.dockerignore` 排除本地环境文件、凭据和运行目录。Compose 静态校验、源码构建及三服务启动通过，应用健康检查、首页和状态接口检查通过；按用户要求停止旧 `new-api` 容器。当前仍待首次管理员初始化和业务主链路验收。操作命令、镜像标识及实际状态见[开发环境记录](../architecture/development-compose.md)。
