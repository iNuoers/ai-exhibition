/** Agent Bot 相关 API */
import { http } from '~/services/request'
import type {
    AgentBotCreate,
    AgentBotUpdate,
    AgentBotResponse,
    AgentBotGenerateRequest,
    PublicAgentInfo,
    PublicChatRequest,
} from '../models/agent'

const PREFIX = '/api/v1/agents'
const PUBLIC_PREFIX = '/api/v1/public'

export const agentApi = {
    /** 手动创建 Agent */
    create: (data: AgentBotCreate) =>
        http.post<AgentBotResponse>(PREFIX, data),

    /** AI 生成 Agent */
    generate: (data: AgentBotGenerateRequest) =>
        http.post<AgentBotResponse>(`${PREFIX}/generate`, data),

    /** 列出当前用户的 Agent */
    list: () =>
        http.get<AgentBotResponse[]>(PREFIX),

    /** 获取 Agent 详情 */
    get: (id: number) =>
        http.get<AgentBotResponse>(`${PREFIX}/${id}`),

    /** 更新 Agent */
    update: (id: number, data: AgentBotUpdate) =>
        http.patch<AgentBotResponse>(`${PREFIX}/${id}`, data),

    /** 发布 Agent */
    publish: (id: number) =>
        http.post<AgentBotResponse>(`${PREFIX}/${id}/publish`),

    /** 取消发布 Agent */
    unpublish: (id: number) =>
        http.post<AgentBotResponse>(`${PREFIX}/${id}/unpublish`),

    /** 删除 Agent */
    delete: (id: number) =>
        http.delete<{ message: string }>(`${PREFIX}/${id}`),

    /** 测试对话 */
    testChat: (id: number, message: string) =>
        http.post<{ reply: string }>(`${PREFIX}/${id}/test-chat`, { message }),
}

/** 访客端公开 API（无需认证） */
export const publicApi = {
    /** 获取 Agent 公开信息 */
    getAgentInfo: (shareToken: string) =>
        http.get<PublicAgentInfo>(`${PUBLIC_PREFIX}/agents/${shareToken}`, { noAuth: true }),

    /** 访客对话 */
    chat: (shareToken: string, data: PublicChatRequest) =>
        http.post<{ reply: string }>(`${PUBLIC_PREFIX}/agents/${shareToken}/chat`, data, { noAuth: true }),
}
