import { useState } from 'react'

import { Check, Copy, PencilLine, Sparkles } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Message, useChatStore } from '@/stores/chat/chat-store'

function MessageActions({ message, isUser }: { message: Message; isUser: boolean }) {
    const { setInputValue, setEditingMessageId } = useChatStore()
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            className={cn(
                'flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100',
                isUser ? '-mr-0.5 justify-end' : 'mt-1 -ml-0.5'
            )}
        >
            <TooltipProvider delayDuration={0}>
                {isUser && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => {
                                    setInputValue(message.content)
                                    setEditingMessageId(message.id)
                                }}
                                className="flex size-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <PencilLine className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Edit</TooltipContent>
                    </Tooltip>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{copied ? 'Copied!' : 'Copy'}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

function MessageReasoning({ reasoning }: { reasoning?: string }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!reasoning) return null

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-fit max-w-[min(100%,56ch)]">
            <CollapsibleTrigger className="mb-1.5 flex items-center gap-2 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
                <Sparkles className="size-3" />
                {isOpen ? 'Hide reasoning' : 'Show reasoning'}
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="mb-2 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-[13px] text-muted-foreground leading-[1.65]">
                    {reasoning}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export function ChatMessage({ message }: { message: Message & { reasoning?: string } }) {
    const isUser = message.role === 'user'
    const isAssistant = !isUser

    const attachments =
        message.attachments && message.attachments.length > 0 ? (
            <div className="no-scrollbar mb-2 flex w-full flex-row gap-2 overflow-x-auto pb-1">
                {message.attachments.map((file) => (
                    <div
                        key={file.id}
                        className="relative flex w-48 shrink-0 overflow-hidden rounded-xl border bg-background shadow-sm sm:w-56"
                    >
                        {file.type === 'image' ? (
                            <div className="relative aspect-video w-full">
                                {/* Performance optimization:
                                    Using native <img> for blob URLs instead of Next.js <Image>
                                    to avoid server-side optimization overhead for client-local temporary files. */}
                                {/* biome-ignore lint/performance/noImgElement: Blob URLs should not be optimized by Next.js */}
                                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="flex w-full items-center gap-3 bg-card/70 p-3 text-sm">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    📎
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate font-medium text-sm">{file.name}</span>
                                    <span className="truncate text-muted-foreground text-xs">Document</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : null

    const content = (
        <>
            {attachments}
            <MessageReasoning reasoning={message.reasoning} />
            {message.content && (
                <div
                    className={cn(
                        'text-[13px] leading-[1.65]',
                        isUser &&
                            'w-fit max-w-[min(80%,56ch)] whitespace-pre-wrap break-words rounded-2xl rounded-br-lg border border-border/30 bg-gradient-to-br from-secondary to-muted px-3.5 py-2 shadow-sm'
                    )}
                >
                    {message.content}
                </div>
            )}
            <MessageActions message={message} isUser={isUser} />
        </>
    )

    return (
        <div
            className={cn('group/message w-full', isUser && 'animate-[fade-up_0.25s_cubic-bezier(0.22,1,0.36,1)]')}
            data-role={message.role}
        >
            <div className={cn(isUser ? 'flex flex-col items-end gap-1' : 'flex w-full items-start gap-3')}>
                {isAssistant && (
                    <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
                            <Sparkles className="size-3.5" />
                        </div>
                    </div>
                )}

                {isAssistant ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">{content}</div>
                ) : (
                    content
                )}
            </div>
        </div>
    )
}

export function TypingIndicator() {
    return (
        <div className="group/message w-full" data-role="assistant">
            <div className="flex items-start gap-3">
                <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
                        <Sparkles className="size-3.5" />
                    </div>
                </div>
                <div className="flex h-[calc(13px*1.65)] items-center text-[13px] text-muted-foreground leading-[1.65]">
                    <span className="animate-pulse font-medium">Thinking...</span>
                </div>
            </div>
        </div>
    )
}
