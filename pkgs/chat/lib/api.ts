import type { AgentInfo, StreamChunk } from './types'

/**
 * 客户端请求走 /api 代理（Next.js rewrites → 后端），避免 CORS。
 * 服务端组件（SSR）可直接访问后端。
 */
const API_BASE =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1')
    : '/api'

/**
 * 获取 Agent 公开信息
 */
export async function getAgentInfo(shareToken: string): Promise<AgentInfo> {
  const res = await fetch(`${API_BASE}/public/${shareToken}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'AGENT_NOT_FOUND' : `HTTP ${res.status}`)
  }
  return res.json()
}

export interface StreamChatOptions {
  shareToken: string
  message: string
  visitorSessionId?: string | null
  signal?: AbortSignal
}

/**
 * 发起流式对话，返回 Response（由调用方消费流）
 */
export async function streamChat({
  shareToken,
  message,
  visitorSessionId,
  signal,
}: StreamChatOptions): Promise<Response> {
  // 流式请求走 Next.js Route Handler（/app/api/public/[shareToken]/chat/stream/route.ts）
  // 直接透传 ReadableStream，不会被 rewrite 代理缓冲
  const res = await fetch(`/api/public/${shareToken}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      visitor_session_id: visitorSessionId ?? undefined,
    }),
    signal,
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('AGENT_NOT_FOUND')
    if (res.status === 429) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.detail || 'RATE_LIMITED')
    }
    throw new Error(`HTTP ${res.status}`)
  }

  return res
}

/**
 * 解析 SSE 流，逐 chunk yield
 *
 * 参考 bolt.new 的 ReadableStream 消费模式
 */
export async function* parseSSEStream(
  response: Response,
): AsyncGenerator<StreamChunk> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按双换行分割 SSE 事件
      const parts = buffer.split('\n\n')
      // 最后一段可能不完整，保留在 buffer
      buffer = parts.pop() || ''

      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith('data: ')) continue

        const json = line.slice(6) // 去掉 "data: "
        if (json === '[DONE]') return

        try {
          const chunk: StreamChunk = JSON.parse(json)
          yield chunk
          if (chunk.done) return
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    // 处理 buffer 中残余数据
    if (buffer.trim()) {
      const line = buffer.trim()
      if (line.startsWith('data: ')) {
        try {
          const chunk: StreamChunk = JSON.parse(line.slice(6))
          yield chunk
        } catch {
          // ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
