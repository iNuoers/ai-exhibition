/**
 * Next.js Route Handler — 透传 SSE 流到客户端
 *
 * Next.js rewrite 会缓冲 StreamingResponse 导致流式失效，
 * 必须用 Route Handler 手动 pipe ReadableStream。
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await params
  const body = await request.json()

  const upstream = await fetch(`${API_BASE}/public/${shareToken}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 直接透传 ReadableStream，不缓冲
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Visitor-Session-Id': upstream.headers.get('X-Visitor-Session-Id') || '',
    },
  })
}
