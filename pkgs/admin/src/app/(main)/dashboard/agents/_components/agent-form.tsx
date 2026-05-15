'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { type AgentRow, agentSchema } from './schema'

interface AgentFormProps {
    initialData?: Partial<AgentRow>
    onSubmit: (data: AgentRow) => void
    onCancel: () => void
}

export function AgentForm({ initialData, onSubmit, onCancel }: AgentFormProps) {
    const form = useForm<AgentRow>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            prompt_template: initialData?.prompt_template || 'You are a helpful AI assistant...',
            llm_provider: initialData?.llm_provider || 'openai',
            llm_model: initialData?.llm_model || 'gpt-4o',
            llm_temperature: initialData?.llm_temperature ?? 0.7,
            is_published: initialData?.is_published ?? false,
            exhibition_id: initialData?.exhibition_id || 1 // default to some ID for now
        }
    })

    return (
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FieldGroup className="gap-4">
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="agent-name">Agent Name</FieldLabel>
                            <Input
                                {...field}
                                id="agent-name"
                                placeholder="AI Guide - Tech Expo"
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="agent-description">Description</FieldLabel>
                            <Input
                                {...field}
                                id="agent-description"
                                placeholder="A guide for the latest tech expo."
                                value={field.value || ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="prompt_template"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="agent-prompt">System Prompt</FieldLabel>
                            <Textarea
                                {...field}
                                id="agent-prompt"
                                placeholder="You are a helpful AI guide for the exhibition. You can answer questions about the schedule, speakers, and booths."
                                className="min-h-[150px] resize-y"
                                value={field.value || ''}
                                aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription>
                                Instructions defining how the AI should behave and what knowledge it possesses.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="llm_provider"
                        render={({ field, fieldState }) => (
                            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                <FieldLabel>Provider</FieldLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select a provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="anthropic">Anthropic</SelectItem>
                                        <SelectItem value="gemini">Google Gemini</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="llm_model"
                        render={({ field, fieldState }) => (
                            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                <FieldLabel>Model</FieldLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                                        <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                                        <SelectItem value="claude-3-5-sonnet">claude-3.5-sonnet</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    control={form.control}
                    name="llm_temperature"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel>Temperature: {field.value}</FieldLabel>
                            <Slider
                                min={0}
                                max={2}
                                step={0.1}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription>
                                Higher values make output more random, lower values make it more focused.
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="is_published"
                    render={({ field, fieldState }) => (
                        <Field
                            orientation="horizontal"
                            className="items-center justify-between rounded-lg border p-4 shadow-sm"
                            data-invalid={fieldState.invalid}
                        >
                            <FieldContent>
                                <FieldLabel htmlFor="agent-published" className="font-medium text-base">
                                    Published Status
                                </FieldLabel>
                                <FieldDescription>
                                    Whether this agent is live and available for user interactions.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </FieldContent>
                            <Switch
                                id="agent-published"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-invalid={fieldState.invalid}
                            />
                        </Field>
                    )}
                />
            </FieldGroup>

            <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">Save Configuration</Button>
            </div>
        </form>
    )
}
