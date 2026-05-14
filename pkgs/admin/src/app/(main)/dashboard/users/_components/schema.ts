import z from "zod";

export const userSchema = z.object({
    id: z.number(),
    email: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
    role: z.string(),
    is_active: z.boolean(),
    openid: z.string().nullable().optional(),
    created_at: z.string().optional(),
});

export type UserRow = z.infer<typeof userSchema>;
