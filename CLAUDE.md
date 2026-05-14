# AI Exhibition - Monorepo

展会智能 Agent 平台：用户爬取展会信息 → AI 生成专属 Agent → 发布分享给访客对话。

## Monorepo 结构

```
pkgs/
├── app/      → 微信小程序前端 (Taro 4 + React 18 + TypeScript + Tailwind CSS)
├── server/   → 后端 API (FastAPI + LangGraph + LangChain + PostgreSQL)
├── chat/     → 访客对话页 (Next.js 16 + React 19 + SSE 流式)
└── admin/    → 管理后台 (Next.js 16 + shadcn/ui + Tailwind CSS 4 + pnpm)
design/       → UI 设计稿 (PNG)
```

## 全局约定

### Git Commit 规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <description>

type: feat | fix | docs | style | refactor | perf | test | chore | ci
scope: app | server | chat | admin | root (可选)
```

示例：
- `feat(server): add exhibition scraping endpoint`
- `fix(app): fix Taro navigation on Android`
- `chore(root): update monorepo gitignore`

### 代码规范

- 所有代码必须有类型标注（TypeScript / Python type hints）
- 优先使用函数式编程风格
- 文件命名：小写 + 下划线（Python）或小驼峰（TypeScript）
- 禁止提交硬编码的密钥或 API key

### 开发命令

| 子包 | 开发 | 构建 |
|------|------|------|
| app | `cd pkgs/app && npm run dev:weapp` | `npm run build:weapp` |
| server | `cd pkgs/server && make dev` | `make docker-run` |
| chat | `cd pkgs/chat && npm run dev` | `npm run build` |
| admin | `cd pkgs/admin && pnpm dev` | `pnpm build` |
