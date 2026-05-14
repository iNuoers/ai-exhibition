/** Agent Bot 相关 React Query Hooks */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { agentApi, publicApi } from '../endpoints/agent'
import { queryKeys } from '../core/query-keys'
import type {
    AgentBotCreate,
    AgentBotGenerateRequest,
    AgentBotUpdate,
    PublicChatRequest,
} from '../models/agent'

/** 获取 Agent 列表 */
export function useAgents() {
    return useQuery({
        queryKey: queryKeys.agents.list(),
        queryFn: () => agentApi.list(),
    })
}

/** 获取 Agent 详情 */
export function useAgent(id: number) {
    return useQuery({
        queryKey: queryKeys.agents.detail(id),
        queryFn: () => agentApi.get(id),
        enabled: id > 0,
    })
}

/** 创建 Agent */
export function useCreateAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: AgentBotCreate) => agentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
        },
    })
}

/** AI 生成 Agent */
export function useGenerateAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: AgentBotGenerateRequest) => agentApi.generate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
        },
    })
}

/** 更新 Agent */
export function useUpdateAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AgentBotUpdate }) =>
            agentApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(id) })
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.list() })
        },
    })
}

/** 发布 Agent */
export function usePublishAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => agentApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(id) })
        },
    })
}

/** 取消发布 Agent */
export function useUnpublishAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => agentApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(id) })
        },
    })
}

/** 删除 Agent */
export function useDeleteAgent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => agentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
        },
    })
}

/** 测试对话 */
export function useTestChat() {
    return useMutation({
        mutationFn: ({ id, message }: { id: number; message: string }) =>
            agentApi.testChat(id, message),
    })
}

/** 获取公开 Agent 信息（访客端） */
export function usePublicAgent(shareToken: string) {
    return useQuery({
        queryKey: queryKeys.public.agent(shareToken),
        queryFn: () => publicApi.getAgentInfo(shareToken),
        enabled: !!shareToken,
    })
}

/** 访客对话 */
export function usePublicChat() {
    return useMutation({
        mutationFn: ({ shareToken, data }: { shareToken: string; data: PublicChatRequest }) =>
            publicApi.chat(shareToken, data),
    })
}
