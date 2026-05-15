# AI Exhibition - Monorepo

本文件为 Claude Code 在本仓库中工作时提供全局的指导说明。

展会智能 Agent 平台：用户抓取展会信息 → AI 生成专属 Agent → 发布分享给访客对话。

## 目录结构与详细规范 (Skills)

本项目采用了高度模块化的规范定义。针对不同的子包，请参考 `.claude/skills/` 目录下的专属规范：

- 🐍 **[pkgs/server 后端开发规范](./.claude/skills/dev-fastapi/SKILL.md)**: FastAPI, Pydantic, 异步 I/O 及 LangGraph Agent 开发原则。
- 🦀 **[pkgs/app 小程序开发规范](./.claude/skills/dev-taro/SKILL.md)**: Taro 4, 跨端组件, Tailwind 小程序适配限制。
- 🏢 **[pkgs/admin 管理后台规范](./.claude/skills/dev-nextjs-admin/SKILL.md)**: Next.js 16, 数据表格, 表单双端校验与 shadcn/ui 深度使用。
- 💬 **[pkgs/chat 访客对话端规范](./.claude/skills/dev-nextjs-chat/SKILL.md)**: Next.js 16, 极致轻量化, SSE 流式对话防抖动渲染。
- 🚀 **[全栈启动与排障指南](./.claude/skills/system-workflow/SKILL.md)**: 各个包的命令大全及常见环境报错排查。
- 🧐 **[本地 Review 机制](./.claude/skills/local-review/SKILL.md)**: 如何审查代码。

**系统级架构设计**，请参阅：
- 🏗️ **[整体架构拓扑设计](./.claude/design/architecture.md)**
- 🔌 **[API 接口设计规范](./.claude/design/api.md)**
- 📊 **[日志与全链路追踪设计](./.claude/design/logger.md)**

```text
pkgs/
├── app/      → 微信小程序前端 (Taro 4 + React 18 + TS + Tailwind) [npm]
├── server/   → 后端 API (FastAPI + LangGraph + PostgreSQL) [pip/make]
├── chat/     → 访客对话页 (Next.js 16 + React 19 + SSE) [npm]
└── admin/    → 管理后台 (Next.js 16 + shadcn/ui + Tailwind 4) [pnpm]
```

## 全局通用约定

### Git Commit 规范

使用 Conventional Commits 格式：

```text
<type>(<scope>): <description>

type: feat | fix | docs | style | refactor | perf | test | chore | ci
scope: app | server | chat | admin | root (可选)
```

示例：
- `feat(server): add exhibition scraping endpoint`
- `fix(app): fix Taro navigation on Android`

### 基础代码规范

- **所有代码必须有类型标注**（TypeScript / Python type hints）
- 优先使用函数式编程风格
- 文件命名：小写 + 下划线（Python）或小驼峰（TypeScript）
- **绝密原则**：绝对禁止提交硬编码的密钥或 API key，必须走系统环境变量 (`.env`)。