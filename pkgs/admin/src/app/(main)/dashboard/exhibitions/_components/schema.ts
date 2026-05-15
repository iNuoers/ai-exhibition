import z from 'zod'

export const exhibitionSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    is_active: z.boolean(),
    source_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal(''))
})

export type ExhibitionRow = z.infer<typeof exhibitionSchema>
