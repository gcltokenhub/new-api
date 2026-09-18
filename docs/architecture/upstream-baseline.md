# Token 工厂：New-API 上游基线记录

- 记录编号：UPSTREAM-TF-001
- 状态：已导入，容器源码构建通过；业务验收待执行
- 核验日期：2026-09-15
- 上游仓库：[`QuantumNous/new-api`](https://github.com/QuantumNous/new-api)
- 本地 Git remote：`upstream`
- 固定引用：`main`
- 固定提交：`69a50029819a26c53e6babd276d49cfe2f8880ad`

## 核验结果

| 项目 | 结果 |
| --- | --- |
| 提交可达性 | 本地 `upstream/main` 解析为 `69a50029819a26c53e6babd276d49cfe2f8880ad`。 |
| 许可证 | 上游 `LICENSE` 为 GNU Affero General Public License v3.0（AGPLv3）。 |
| 后端入口 | 仓库根目录包含 `go.mod`、`Dockerfile` 与 `docker-compose.yml`；模块为 `github.com/QuantumNous/new-api`，`go.mod` 声明 Go `1.25.1`。 |
| 前端入口 | `web/` 包含 `package.json`、`bun.lock`、`src/`、`rsbuild.config.ts` 与 `vitest.config.ts`。 |
| 目录证据 | 根目录包含 `controller`、`middleware`、`model`、`service`、`router`、`relay`、`relaykit`、`plugins`、`setting`、`oauth`、`i18n`、`web`。 |

## 导入结果

当前仓库已包含 Token 工厂的治理提交，采用保留历史的方式将固定的 `upstream/main` 合并进 `codex/import-new-api` 分支。`.gitignore` 合并了 Token 工厂安全规则与上游构建/运行产物规则；根目录 `AGENTS.md` 和 `README.md` 保留 Token 工厂治理入口。

合并产生的同名文件冲突仅限 `.gitignore`、`AGENTS.md` 和 `README.md`，均已按上述原则解决。上游完整历史由合并提交的第二父提交保留，可通过 `upstream` remote 继续同步和审查。

本机仅检测到 Node `v22.22.0`；未安装宿主机 Go 或 Bun。2026-09-15 使用上游 Dockerfile 固定的 Go 1.26.1 / Bun 1.4.0 容器工具链完成前后端构建，Compose build 退出码 0；开发应用健康检查及首页/状态接口检查通过。单元测试、真实模型主链路和许可证审查尚未完成，不将上述结果等同于全部验收通过。详见[开发环境记录](development-compose.md)。

## 许可证与安全边界

- AGPLv3 的网络交互、源代码提供和发布义务须在任何对外部署前由项目负责人完成合规确认。
- 不提交上游或环境中的密钥、凭据、内部地址、数据库数据和真实日志。
- 本记录固定的是可复现源码快照，不代表该快照已经通过安全、功能、性能或兼容性测试。
