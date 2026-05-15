---
name: system-workflow
description: 全栈启动、构建和跨子包依赖问题排查指南。当用户想把整个平台跑起来或报错相关依赖问题时使用。
---

# 🚀 系统工作流与排障指南 (Workflow & Troubleshooting)

> 快速定位并执行 `ai-exhibition` 中不同包的开发、构建指令，以及跨端调试的技巧。

## 何时使用此技能

- 用户需要**启动项目**（如：“帮我把管理后台跑起来”、“后端怎么启动”）。
- 用户遇到**包管理器冲突**（如：pnpm 和 npm 乱用导致的问题）。
- CI/CD 环境下的构建失败排查。
- 本地端口冲突或者数据库连不上的情况。

## 1. 核心指令表

这个仓库是一个 Monorepo，包含多个应用端。**千万不要在根目录随意执行 npm install 或 pnpm install**，一定要进入对应的子包。

| 子模块 | 路径 | 核心技术栈 | 开发运行 | 构建部署 | 包管理器 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **管理台 (Admin)** | `pkgs/admin` | Next.js 16 + shadcn/ui | `pnpm dev` (默认端口 3000) | `pnpm build` | **pnpm** |
| **访客页 (Chat)** | `pkgs/chat` | Next.js 16 | `npm run dev` (默认端口 3001) | `npm run build` | **npm** |
| **小程序 (App)** | `pkgs/app` | Taro 4 + React 18 | `npm run dev:weapp` | `npm run build:weapp` | **npm** |
| **后端 API (Server)**| `pkgs/server` | FastAPI + LangGraph | `make dev` (默认端口 8000) | `make docker-build`| `pip`/`make` |

> *注意：Chat 和 Admin 为了防止冲突，必须运行在不同的端口上。*

## 2. 常见问题排障指南

### 🔴 2.1 后端环境问题 (Python)
如果执行 `make dev` 报错说找不到包，或者提示 `ModuleNotFoundError`:
1. 确保你在 `pkgs/server` 目录下。
2. 确保虚拟环境已激活。推荐使用 `uv` 或者标准的 `python -m venv .venv`。
3. 执行 `pip install -r requirements.txt` 或相关的依赖安装命令。

### 🔴 2.2 前端包管理器混用报错
`admin` 使用 `pnpm`，而 `app`/`chat` 使用了 `npm`。如果不小心在 `admin` 里用了 `npm install`：
1. 删除错误的 `package-lock.json` 或 `node_modules`。
2. 重新执行 `pnpm install`。

### 🔴 2.3 数据库连接失败 (PostgreSQL)
后端启动时报类似 `asyncpg.exceptions.ConnectionDoesNotExistError` 的错误：
1. 检查环境变量：阅读 `pkgs/server/.env` 或 `.env.example`。
2. 确认本地 Docker 里的 Postgres 是否已经启动，或者测试环境数据库是否可达。

## 3. 全链路测试建议
当用户完成一个全栈需求（例如：“增加一个展会信息并在前端展示”）时：
1. 建议先启动 `pkgs/server` 提供数据接口支持。
2. 再启动对应的展示端（Admin 检查数据是否入库，App/Chat 检查是否展示正确）。
3. 提示用户提供相关截图（Claude Code 支持读取截图以进行 UI 核对）。
