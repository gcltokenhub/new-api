# CR-002：导入固定 New-API 源码快照

- 状态：已执行，构建待环境补齐
- 日期：2026-09-15
- 关联基线：[UPSTREAM-TF-001](../architecture/upstream-baseline.md)
- 上游提交：`69a50029819a26c53e6babd276d49cfe2f8880ad`

## 决策

在隔离分支 `codex/import-new-api` 中，以保留上游历史的合并方式导入 `QuantumNous/new-api` 的固定快照。根目录治理文档由 Token 工厂维护；上游源码、许可证和第二父提交保留用于审查和后续同步。

## 冲突处理

- `.gitignore`：合并项目安全规则与上游构建、运行产物规则。
- `AGENTS.md`：保留 Token 工厂的需求与 Git 治理规则；上游源码目录中的原有说明文件随源码保留。
- `README.md`：保留 Token 工厂产品和文档入口；上游多语言 README 与许可证文件随源码保留。

## 验证状态

合并已无未解决冲突，且已执行 `git diff --check`。本机未检测到 Go 和 Bun，未运行上游构建、单元测试或服务启动；因此不宣称源码可构建或业务能力已验证。
