'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { type ExhibitionRow, exhibitionSchema } from './schema'

interface ExhibitionFormProps {
    initialData?: Partial<ExhibitionRow>
    onSubmit: (data: ExhibitionRow) => void
    onCancel: () => void
}

export function ExhibitionForm({ initialData, onSubmit, onCancel }: ExhibitionFormProps) {
    const form = useForm<ExhibitionRow>({
        resolver: zodResolver(exhibitionSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            start_date: initialData?.start_date || '',
            end_date: initialData?.end_date || '',
            location: initialData?.location || '',
            is_active: initialData?.is_active ?? true,
            source_url: initialData?.source_url || ''
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
                            <FieldLabel htmlFor="exhibition-name">Name</FieldLabel>
                            <Input
                                {...field}
                                id="exhibition-name"
                                placeholder="Tech Expo 2025"
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
                            <FieldLabel htmlFor="exhibition-description">Description</FieldLabel>
                            <Textarea
                                {...field}
                                id="exhibition-description"
                                placeholder="Details about the exhibition..."
                                className="resize-none"
                                value={field.value || ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="start_date"
                        render={({ field, fieldState }) => (
                            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                <FieldLabel>Start Date</FieldLabel>
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date) => field.onChange(date ? date.toISOString() : '')}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="end_date"
                        render={({ field, fieldState }) => (
                            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                <FieldLabel>End Date</FieldLabel>
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date) => field.onChange(date ? date.toISOString() : '')}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    control={form.control}
                    name="location"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="exhibition-location">Location</FieldLabel>
                            <Input
                                {...field}
                                id="exhibition-location"
                                placeholder="Convention Center"
                                value={field.value || ''}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="source_url"
                    render={({ field, fieldState }) => (
                        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="exhibition-source-url">Source URL (for crawler)</FieldLabel>
                            <Input
                                {...field}
                                id="exhibition-source-url"
                                placeholder="https://example.com/exhibition"
                                value={field.value || ''}
                                aria-invalid={fieldState.invalid}
                            />
                            <FieldDescription>The URL from which the exhibition details were scraped.</FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="is_active"
                    render={({ field, fieldState }) => (
                        <Field
                            orientation="horizontal"
                            className="items-center justify-between rounded-lg border p-4 shadow-sm"
                            data-invalid={fieldState.invalid}
                        >
                            <FieldContent>
                                <FieldLabel htmlFor="exhibition-active" className="font-medium text-base">
                                    Active Status
                                </FieldLabel>
                                <FieldDescription>
                                    Whether this exhibition is currently active and visible.
                                </FieldDescription>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </FieldContent>
                            <Switch
                                id="exhibition-active"
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
                <Button type="submit">Save Exhibition</Button>
            </div>
        </form>
    )
}
