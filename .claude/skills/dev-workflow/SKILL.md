---
name: dev-workflow
description: 当用户询问如何启动、构建项目或处理 Monorepo 依赖关系时触发该技能。
---
# Monorepo 开发工作流指南

> 快速定位并执行 `ai-exhibition` 中不同包的开发、构建指令。

## 何时使用此技能
当用户要求“把后端跑起来”、“怎么打包前端”或遇到跨包依赖问题时触发。

## 启动与构建对照表

| 子模块 | 路径 | 核心技术栈 | 开发命令 | 构建命令 |
| --- | --- | --- | --- | --- |
| **小程序 (app)** | `pkgs/app` | Taro 4 + React 18 | `cd pkgs/app && npm run dev:weapp` | `npm run build:weapp` |
| **后端 (server)** | `pkgs/server` | FastAPI + LangGraph | `cd pkgs/server && make dev` | `make docker-run` |
| **访客页 (chat)** | `pkgs/chat` | Next.js 16 + React | `cd pkgs/chat && npm run dev` | `npm run build` |
| **管理台 (admin)**| `pkgs/admin` | Next.js 16 + shadcn | `cd pkgs/admin && pnpm dev` | `pnpm build` |

## 遇到依赖错误时的排查
- 项目是 Monorepo。注意前端相关（admin 等）可能使用了 pnpm，而 app 使用了 npm，确保在正确的包目录下执行各自对应的包管理器命令。
- 如果提示 Python 模块找不到，进入 `pkgs/server` 检查虚拟环境或通过 `pip install -r requirements.txt` (或 `poetry`/`uv` 视具体依赖管理工具而定) 更新依赖。