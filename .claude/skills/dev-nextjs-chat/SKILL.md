---
name: dev-nextjs-chat
description: 沉浸式访客对话页 (pkgs/chat) 开发规范。重点规范大模型 Server-Sent Events (SSE) 流式传输处理和极端性能优化。
---

# Chat 访客交互端开发规范 (Next.js 16)

> 本指南专属适用于 `pkgs/chat`，即直接面向终端访客（C端用户）的沉浸式 AI 对话产品。

## 何时使用此技能

- 在 `pkgs/chat` 中修改 AI 对话框、聊天气泡
- 调试或优化大模型生成时的流式打字机效果 (SSE)
- 优化 Markdown 在流式输出时的渲染抖动

## 核心原则

### 🔴 必须遵守的规则

1. **极其轻量**：Chat 端是 C 端用户的门面，必须秒开。除了 `react-markdown` 及其必要的插件，以及 `ai` (AI SDK) 外，严禁引入大型组件库（不要在这里引入整个 shadcn/ui 表格体系）。
2. **极简样式**：不依赖沉重的第三方 UI 库，使用 Tailwind CSS 自定义极简且高度定制化的气泡和输入框样式。
3. **流式容错**：AI 的输出是按块 (chunk) 流式到达的，过程中可能包含不成对的 Markdown 标记或代码块，渲染器必须能容忍截断的输入而不崩溃。
4. **滚动控制**：流式生成期间，对话流的窗口必须平滑且自动地固定在最底部。

## 开发流程与范式

### 步骤 1: 构建流式对话核心逻辑 (Client Component)

对话页面强烈依赖客户端交互，使用 `@ai-sdk/react` （或类似逻辑）接管状态。

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'
import { ChatMessage } from './_components/ChatMessage'

export default function ChatWindow({ agentId }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // body 会包含传递给后端 FastAPI 的额外信息
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: process.env.NEXT_PUBLIC_API_URL + '/api/chat', 
    body: { agentId }
  })

  // 确保滚动条贴底
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-gray-50">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 scroll-smooth"
      >
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <div className="text-sm text-gray-400">Agent 思考中...</div>}
      </div>
      
      <div className="bg-white p-3 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            value={input}
            onChange={handleInputChange}
            className="flex-1 rounded-full border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="问问关于展会的信息..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-blue-600 px-5 py-2 text-white font-medium disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 步骤 2: Markdown 流式防抖动渲染

如果后端返回包含 Markdown (特别是表格或代码块)，使用 `react-markdown` 并配合 `remarkGfm` 进行渲染，注意样式覆写。

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remarkGfm'

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-white shadow-sm text-gray-800 rounded-bl-sm border border-gray-100'
        }
      `}>
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          // 使用 prose typography 插件控制 markdown 样式
          <div className="prose prose-sm max-w-none prose-blue">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
```