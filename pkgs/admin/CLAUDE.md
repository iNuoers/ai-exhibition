# Admin 管理后台

展会智能 Agent 平台的管理后台，用于维护会议、用户、基础信息等。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **UI**: shadcn/ui + Radix UI + Tailwind CSS 4
- **表单**: React Hook Form + Zod 验证
- **表格**: TanStack Table
- **图表**: Recharts
- **状态**: Zustand
- **图标**: Lucide React
- **包管理**: pnpm
- **Lint/Format**: Biome

## 目录结构

```
src/
├── app/                → 页面路由 (App Router)
│   ├── (external)/     → 公开页面（登录前）
│   └── (main)/         → 主布局（含侧边栏）
│       ├── auth/       → 登录/注册
│       └── dashboard/  → 仪表盘模块
├── components/         → 共享组件
│   └── ui/             → shadcn/ui 基础组件
├── config/             → 应用配置
├── data/               → 静态/模拟数据
├── hooks/              → 自定义 Hooks
├── lib/                → 工具函数、偏好设置
├── navigation/         → 侧边栏导航配置
├── server/             → Server Actions
├── stores/             → Zustand 状态管理
└── styles/             → 全局样式、主题预设
```

## 开发命令

```bash
pnpm dev              # 开发服务器 (默认 3000，项目中用 3002)
pnpm build            # 生产构建
pnpm lint             # Biome 检查
pnpm format           # Biome 格式化
pnpm check:fix        # Biome 检查 + 自动修复
```

## 代码规范

- 文件命名：kebab-case
- 页面私有组件放 `_components/` 目录
- UI 基础组件统一在 `components/ui/`，通过 `shadcn` CLI 添加
- 表单使用 React Hook Form + Zod schema 验证
- 服务端操作放 `server/server-actions.ts`
