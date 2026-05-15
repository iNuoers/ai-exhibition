import z from 'zod'

export const conversationSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    user_nickname: z.string().optional(),
    exhibition_name: z.string().optional(),
    agent_name: z.string().optional(),
    is_active: z.boolean(),
    created_at: z.string().optional(),
    message_count: z.number().optional()
})

export type ConversationRow = z.infer<typeof conversationSchema>
