import { type ChangeEvent, type FormEvent, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Brain, Check, Eye, Settings, Wrench, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat/chat-store'

import { ArrowUpIcon, PaperclipIcon } from './icons'

const SUGGESTED_QUESTIONS = [
    "What's the current visitor count?",
    "Summarize yesterday's chat logs",
    'Show me the most asked questions',
    'Analyze sentiment of negative feedbacks'
]

const MODELS = [
    { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o' },
    { id: 'claude-3-5', provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
    { id: 'agent', provider: 'cloudflare', name: 'Exhibition Agent' }
]

function ModelSelectorLogo({ provider, className }: { provider: string; className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            alt={`${provider} logo`}
            className={cn('size-4 dark:invert', className)}
            height={16}
            width={16}
            src={`https://models.dev/logos/${provider}.svg`}
        />
    )
}

function ModelSelectorCompact() {
    const { selectedModel, setSelectedModel } = useChatStore()
    const [open, setOpen] = useState(false)

    const selected = MODELS.find((m) => m.id === selectedModel) || MODELS[0]

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-7 max-w-[200px] justify-between gap-1.5 rounded-lg px-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                    data-testid="model-selector"
                >
                    <span className="flex items-center gap-1.5">
                        <ModelSelectorLogo provider={selected.provider} />
                        <span className="truncate">{selected.name}</span>
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search models..." className="h-9 text-xs" />
                    <CommandList>
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup heading="Available">
                            {MODELS.map((model) => (
                                <CommandItem
                                    key={model.id}
                                    value={model.name}
                                    onSelect={() => {
                                        setSelectedModel(model.id)
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center py-2 text-[12px]',
                                        selectedModel === model.id && 'border-b border-dashed border-foreground/50'
                                    )}
                                >
                                    <ModelSelectorLogo provider={model.provider} className="mr-2 opacity-80" />
                                    <span className="font-medium">{model.name}</span>
                                    <div className="ml-auto flex items-center gap-2 text-foreground/70">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                // Event Delegation Check:
                                                // Prevent bubbling to CommandItem's onSelect, otherwise
                                                // clicking Settings will trigger model selection and close the Popover.
                                                e.stopPropagation()
                                                window.alert('TODO: Implement Model Settings Dialog')
                                            }}
                                            className="ml-1 flex items-center justify-center rounded-sm p-1 text-muted-foreground/50 transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                        >
                                            <Settings className="size-3.5" />
                                        </button>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export function ChatInput() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {
        clearStagedFiles,
        stagedFiles,
        setStagedFiles,
        removeStagedFile,
        messages,
        addMessage,
        updateMessage,
        setIsTyping,
        inputValue,
        setInputValue,
        editingMessageId,
        setEditingMessageId
    } = useChatStore()

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return

        const newFiles = Array.from(e.target.files).map((file) => {
            const isImage = file.type.startsWith('image/')
            return {
                id: crypto.randomUUID(),
                file,
                url: isImage ? URL.createObjectURL(file) : '',
                type: isImage ? ('image' as const) : ('document' as const),
                name: file.name
            }
        })

        setStagedFiles((prev) => [...prev, ...newFiles])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = (e?: FormEvent) => {
        if (!inputValue.trim() && stagedFiles.length === 0) return

        if (editingMessageId) {
            updateMessage(editingMessageId, { content: inputValue.trim() })
            setInputValue('')
            setEditingMessageId(null)
            return
        }

        e?.preventDefault()

        const userMessage = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: inputValue.trim(),
            attachments: stagedFiles.length > 0 ? [...stagedFiles] : undefined,
            createdAt: new Date()
        }

        addMessage(userMessage)
        setInputValue('')
        clearStagedFiles()
        setIsTyping(true)

        setTimeout(() => {
            setIsTyping(false)
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                reasoning:
                    'I received the file attachments and user text. I will now process them and return a polite response.',
                content:
                    "This is a mock response from the expert team's new Chat Component. \n\nI can assist you with your exhibition data!",
                createdAt: new Date()
            })
        }, 1500)
    }

    const handleSuggestedClick = (question: string) => {
        addMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: question,
            createdAt: new Date()
        })
        setIsTyping(true)

        setTimeout(() => {
            setIsTyping(false)
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                reasoning:
                    "First, I'll search the database for recent metrics related to the user's query. Then, I'll format it into a friendly response.",
                content: `Here is the requested information for: "${question}"\n\n(This is mock data from the agent.)`,
                createdAt: new Date()
            })
        }, 1500)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="relative flex w-full flex-col gap-2 px-4 pb-4">
            {editingMessageId && (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span>Editing message</span>
                    <button
                        className="rounded px-1.5 py-0.5 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => {
                            setEditingMessageId(null)
                            setInputValue('')
                        }}
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            )}
            {messages.length === 0 && (
                <div
                    className="no-scrollbar flex w-full gap-2.5 overflow-x-auto pb-1 "
                    data-testid="suggested-actions"
                    style={{
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch',
                        msOverflowStyle: 'none'
                    }}
                >
                    {SUGGESTED_QUESTIONS.map((q, index) => (
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className="min-w-[200px] shrink-0 "
                            exit={{ opacity: 0, y: 16 }}
                            initial={{ opacity: 0, y: 16 }}
                            key={q}
                            transition={{
                                delay: 0.06 * index,
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <button
                                type="button"
                                className="h-auto whitespace-nowrap rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-left text-[12px] text-muted-foreground leading-relaxed transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/60 hover:text-foreground hover:shadow-[var(--shadow-card)] "
                                onClick={() => handleSuggestedClick(q)}
                            >
                                {q}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <form
                className="w-full [&>div]:rounded-2xl [&>div]:border [&>div]:border-border/30 [&>div]:bg-card/70 [&>div]:shadow-[var(--shadow-composer)] [&>div]:transition-shadow [&>div]:duration-300 [&>div]:focus-within:shadow-[var(--shadow-composer-focus)]"
                onSubmit={handleSubmit}
            >
                <InputGroup className="overflow-hidden">
                    {stagedFiles.length > 0 && (
                        <div
                            className="no-scrollbar flex w-full flex-row gap-2 self-start overflow-x-auto px-3 pt-3"
                            data-testid="attachments-preview"
                        >
                            {stagedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/50"
                                >
                                    {file.type === 'image' ? (
                                        // biome-ignore lint/performance/noImgElement: Native img is intentionally used for local Blob URLs
                                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 p-2 text-[10px]">
                                            <PaperclipIcon />
                                            <span className="max-w-[48px] truncate font-medium">{file.name}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeStagedFile(file.id)}
                                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <InputGroupTextarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="field-sizing-content max-h-48 min-h-24 px-4 pt-3.5 pb-1.5 text-[13px] leading-relaxed placeholder:text-muted-foreground/35"
                        placeholder="Ask anything..."
                        rows={1}
                        data-testid="multimodal-input"
                    />

                    <InputGroupAddon align="block-end" className="justify-between gap-1 px-3 pb-3">
                        <div className="flex min-w-0 items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            data-testid="attachments-button"
                                            className="h-7 w-7 rounded-lg border border-border/40 p-1 text-foreground transition-colors hover:border-border hover:text-foreground"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <PaperclipIcon size={14} style={{ width: 14, height: 14 }} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Attach file</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                            />
                            <ModelSelectorCompact />
                        </div>

                        <InputGroupButton
                            type="submit"
                            size="sm"
                            className={cn(
                                'h-7 w-7 rounded-xl transition-all duration-200',
                                inputValue.trim() || stagedFiles.length > 0
                                    ? 'bg-foreground text-background hover:opacity-85 active:scale-95'
                                    : 'cursor-not-allowed bg-muted text-muted-foreground/25'
                            )}
                            data-testid="send-button"
                            disabled={!inputValue.trim() && stagedFiles.length === 0}
                        >
                            <ArrowUpIcon className="size-4" />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </form>
        </div>
    )
}
