'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AgentInfo, ChatMessage } from '@/lib/types'
import { parseSSEStream, streamChat } from '@/lib/api'
import { getVisitorSessionId, setVisitorSessionId } from '@/lib/session'
import ChatBubble from './chat-bubble'

interface ChatBotProps {
  shareToken: string
  agentInfo: AgentInfo
}

export default function ChatBot({ shareToken, agentInfo }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // 用欢迎语初始化
    if (!agentInfo.welcome_message) return []
    return [{
      id: 'welcome',
      role: 'assistant' as const,
      content: agentInfo.welcome_message,
      createdAt: new Date().toISOString(),
    }]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distanceFromBottom > 100)
  }, [])

  const handleSend = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isLoading) return

    setError(null)

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    // 创建占位 assistant 消息
    const assistantId = `assistant-${Date.now()}`
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const sessionId = getVisitorSessionId(shareToken)
      const response = await streamChat({
        shareToken,
        message: trimmed,
        visitorSessionId: sessionId,
        signal: controller.signal,
      })

      // 保存 session id
      const newSessionId = response.headers.get('X-Visitor-Session-Id')
      if (newSessionId) {
        setVisitorSessionId(shareToken, newSessionId)
      }

      // 逐 chunk 追加内容
      for await (const chunk of parseSSEStream(response)) {
        if (chunk.done) break
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk.content }
              : m,
          ),
        )
      }

      // 流结束
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误'

      if (message === 'AGENT_NOT_FOUND') {
        setError('该智能助手不存在或已下线')
      } else if (message === 'RATE_LIMITED' || message.includes('limit')) {
        setError('对话次数已达上限，请稍后再试')
      } else if (controller.signal.aborted) {
        // 用户取消，不显示错误
      } else {
        setError('网络异常，请重试')
      }

      // 移除空的 assistant 消息
      setMessages(prev => {
        const msg = prev.find(m => m.id === assistantId)
        if (msg && !msg.content) {
          return prev.filter(m => m.id !== assistantId)
        }
        return prev.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        )
      })
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [input, isLoading, shareToken])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const sampleQuestions = agentInfo.sample_questions

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-base font-semibold text-gray-800">
            {agentInfo.agent_name}
          </h1>
          {agentInfo.exhibition_name && (
            <p className="text-xs text-gray-400">{agentInfo.exhibition_name}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {/* 示例问题（仅在只有欢迎语时显示） */}
          {sampleQuestions && sampleQuestions.length > 0 && messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-600 transition-colors hover:bg-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Loading 指示器（流式开始前） */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
                🤖
              </div>
              <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce [animation-delay:0.15s]">·</span>
                  <span className="animate-bounce [animation-delay:0.3s]">·</span>
                </span>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-400 underline hover:text-red-500"
              >
                关闭
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-md transition-opacity hover:bg-gray-50"
        >
          ↓ 回到最新
        </button>
      )}

      {/* Input area */}
      <div className="border-t bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-300 focus:bg-white"
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              className="shrink-0 rounded-xl bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              停止
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="shrink-0 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
