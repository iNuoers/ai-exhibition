import { notFound } from 'next/navigation'
import { getAgentInfo } from '@/lib/api'
import ChatBot from '@/components/chat-bot'

interface PageProps {
  params: Promise<{ thread: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { thread: shareToken } = await params

  try {
    const agentInfo = await getAgentInfo(shareToken)
    return <ChatBot shareToken={shareToken} agentInfo={agentInfo} />
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    if (message === 'AGENT_NOT_FOUND') {
      notFound()
    }
    // 其他错误也 notFound，避免暴露内部信息
    notFound()
  }
}
