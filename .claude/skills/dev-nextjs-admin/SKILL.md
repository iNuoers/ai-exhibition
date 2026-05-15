---
name: dev-nextjs-admin
description: B 端管理后台 (pkgs/admin) 开发规范。包含 Next.js App Router、shadcn/ui 深度使用规范、复杂表单以及表格处理指南。
---

# Admin 管理后台开发规范 (Next.js 16)

> 本指南专属适用于 `pkgs/admin`，即提供给参展商和运营人员的 B 端管理控制台。

## 何时使用此技能

- 在 `pkgs/admin` 中新增管理页面、看板或设置面板
- 处理复杂的后台表格 (Data Table) 或表单 (React Hook Form)
- 引入或修改 shadcn/ui 组件

## 核心原则

### 🔴 必须遵守的规则

1. **强后台属性**：Admin 是一个数据密集型的后台。优先保证布局的规整、表单的健壮性和数据的准确性，不过度追求炫酷动画。
2. **全面拥抱 shadcn/ui**：
   - 所有的基础 UI（如 Input, Button, Table, Select, Dialog 等）**必须**使用 `shadcn/ui`，统一存放在 `src/components/ui` 中。
   - 需要新组件时，优先考虑使用 `pnpm dlx shadcn@latest add xxx` 安装。
3. **表单处理标准**：
   - 所有复杂的表单提交必须结合 `react-hook-form` 和 `zod` 进行客户端加服务端双重校验。
   - 使用 shadcn 提供的 `<Form />` 包装器。
4. **Server Actions 优先**：表单的数据提交，优先使用 Next.js 的 Server Actions，减少手写 `/api/xxx` 的胶水层代码。

## 开发流程与范式

### 步骤 1: 构建标准的后台页面布局 (Server Component)

后台页面通常由顶部的 Breadcrumb/Header 和下方的主内容区（如数据表格）构成。

```tsx
import { Suspense } from 'react'
import { fetchExhibitions } from '@/lib/api'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { Skeleton } from '@/components/ui/skeleton'

export default async function AdminExhibitionsPage() {
  const data = await fetchExhibitions()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">展会管理</h2>
      </div>
      
      {/* 使用 Suspense 处理加载状态 */}
      <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </div>
  )
}
```

### 步骤 2: 标准化的表单开发

在 `pkgs/admin` 中处理表单（例如“新建 Agent 配置”）的标准化步骤：

```tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  agentName: z.string().min(2, {
    message: "Agent名称至少包含2个字符",
  }),
})

export function AgentConfigForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { agentName: "" },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 调用 Server Action 或 API
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="agentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent 名称</FormLabel>
              <FormControl>
                <Input placeholder="输入您的 Agent 名字" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">保存配置</Button>
      </form>
    </Form>
  )
}
```
