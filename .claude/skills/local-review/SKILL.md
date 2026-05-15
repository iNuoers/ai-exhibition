---
name: local-review
description: 当用户请求对本地未提交的代码（或特定 commit）进行代码审查时触发该技能。专为 AI Exhibition monorepo 定制。
---
# Local Review 本地代码审查技能

> 在本地开发环境中，全面审查 ai-exhibition monorepo 的代码变更质量、安全性、性能和架构设计。

## 何时使用此技能
当用户输入诸如“review local changes”、“检查下我写的代码”或者直接调用 `/local-review` 时触发。

## 审查步骤

### 1. 拉取代码上下文
使用以下命令获取上下文信息（带有充足的前后文，如 `-U15`）：
```bash
# 获取工作区未暂存及已暂存的混合全量 diff
git diff HEAD -U15

# 或审查最后一次 commit
git diff HEAD~1 HEAD -U15
```

### 2. Monorepo 专属检查项
根据变更发生所在的子包（通过文件路径判断），应用特定的规范：

- **`pkgs/server` (FastAPI / LangGraph)**:
  - 检查是否缺少 Pydantic 的类型验证。
  - 路由函数与业务逻辑是否隔离。
  - LangGraph 节点的 `State` 变更是否纯粹，避免产生难以追踪的副作用。
  
- **`pkgs/app` (Taro 微信小程序)**:
  - 是否错用了普通 HTML 标签（如 `div`），需使用 Taro 组件（如 `View`, `Text`）。
  - 小程序独有生命周期（如 `useDidShow`）处理是否正确。
  - 样式是否符合 Tailwind 在小程序的限制。

- **`pkgs/chat` & `pkgs/admin` (Next.js)**:
  - "use client" 指令是否滥用？尽量保持默认为 Server Component。
  - API 请求和流式 (SSE) 接收逻辑是否健壮。
  - UI 库 (shadcn/ui) 组件抽取是否合理。
  - **代码注释检查**：检查复杂业务逻辑、生命周期副作用 (useEffect)、DOM 事件拦截 (stopPropagation 等) 和特殊内存管理 (URL.revokeObjectURL) 等地方是否包含了清晰的代码注释。

### 3. 生成报告
报告必须结构清晰，按子包分类给出 P0 (必须修复) 到 P2 (建议优化) 级别的修改意见，并直接提供代码修改建议。