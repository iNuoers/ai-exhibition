/** Server 返回的 Agent 公开信息 */
export interface AgentInfo {
  agent_name: string
  exhibition_name?: string | null
  welcome_message: string
  sample_questions?: string[] | null
  contact_info?: Record<string, unknown> | null
}

/** 前端聊天消息 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  /** 流式输出中 */
  isStreaming?: boolean
}

/** SSE 流式响应单个 chunk */
export interface StreamChunk {
  content: string
  done: boolean
}
