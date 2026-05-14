import z from "zod";

export const agentSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable().optional(),
    prompt_template: z.string().nullable().optional(),
    llm_provider: z.string(),
    llm_model: z.string(),
    llm_temperature: z.number().min(0).max(2),
    is_published: z.boolean(),
    exhibition_id: z.number({ message: "Exhibition ID is required" }),
});

export type AgentRow = z.infer<typeof agentSchema>;
