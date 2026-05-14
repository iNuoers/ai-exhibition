/**
 * React Query 查询键管理
 */
export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        session: () => [...queryKeys.auth.all, 'session'] as const,
    },
    exhibitions: {
        all: ['exhibitions'] as const,
        list: () => [...queryKeys.exhibitions.all, 'list'] as const,
        detail: (id: number) => [...queryKeys.exhibitions.all, id] as const,
    },
    agents: {
        all: ['agents'] as const,
        list: () => [...queryKeys.agents.all, 'list'] as const,
        detail: (id: number) => [...queryKeys.agents.all, id] as const,
    },
    public: {
        agent: (shareToken: string) => ['public', 'agent', shareToken] as const,
    },
}
