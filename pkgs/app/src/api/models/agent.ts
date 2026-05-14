/** Agent Bot 相关类型 — 对齐后端 app/schemas/agent.py */

export interface AgentBotCreate {
    name: string
    exhibition_id?: number
    welcome_message?: string
    sample_questions?: string[]
    system_prompt?: string
    custom_knowledge?: Record<string, any>
    contact_info?: Record<string, any>
    config?: Record<string, any>
    daily_limit?: number
    session_turn_limit?: number
}

export interface AgentBotUpdate {
    name?: string
    welcome_message?: string
    sample_questions?: string[]
    system_prompt?: string
    custom_knowledge?: Record<string, any>
    contact_info?: Record<string, any>
    config?: Record<string, any>
    daily_limit?: number
    session_turn_limit?: number
}

export interface AgentBotResponse {
    request_id: string
    id: number
    owner_id: number
    exhibition_id?: number
    name: string
    welcome_message: string
    sample_questions?: string[]
    system_prompt: string
    custom_knowledge?: Record<string, any>
    contact_info?: Record<string, any>
    config?: Record<string, any>
    share_token: string
    is_published: boolean
    daily_limit: number
    session_turn_limit: number
    total_conversations: number
}

export interface AgentBotGenerateRequest {
    exhibition_id: number
    language?: string
}

/** 访客端公开信息 */
export interface PublicAgentInfo {
    request_id: string
    agent_name: string
    exhibition_name?: string
    welcome_message: string
    sample_questions?: string[]
    contact_info?: Record<string, any>
}

export interface PublicChatRequest {
    message: string
    visitor_session_id?: string
}
