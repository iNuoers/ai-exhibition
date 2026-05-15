import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

import { useScrollToBottom } from '@/hooks/chat/use-scroll-to-bottom'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat/chat-store'

import { ChatMessage, TypingIndicator } from './chat-message'

export function ChatMessageList() {
    const { messages, isTyping } = useChatStore()
    const { containerRef, endRef, isAtBottom, scrollToBottom } = useScrollToBottom()

    return (
        <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
            {messages.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
                    <div className="pointer-events-auto flex w-full flex-col items-center">
                        <div className="mb-8 flex flex-col items-center px-4">
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center font-semibold text-2xl text-foreground tracking-tight md:text-3xl"
                                initial={{ opacity: 0, y: 10 }}
                                transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                How can I help you today?
                            </motion.div>
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 max-w-sm text-center text-muted-foreground/80 text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                I'm your AI Exhibition Assistant. You can ask me about visitor stats, chat logs, or
                                analytics.
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'absolute inset-0 touch-pan-y overflow-y-auto px-4',
                    messages.length > 0 ? 'bg-background' : 'bg-transparent'
                )}
                ref={containerRef}
                style={{ scrollbarWidth: 'none' }}
            >
                <div className="flex min-h-full flex-col gap-6 py-6">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={endRef} className="min-h-[24px] min-w-[24px] shrink-0" />
                </div>
            </div>

            <button
                type="button"
                aria-label="Scroll to bottom"
                onClick={() => scrollToBottom('smooth')}
                className={cn(
                    'absolute bottom-4 left-1/2 z-10 flex h-7 -translate-x-1/2 items-center rounded-full border border-border/50 bg-card/90 px-3.5 shadow-sm backdrop-blur-lg transition-all duration-200',
                    isAtBottom ? 'pointer-events-none scale-90 opacity-0' : 'pointer-events-auto scale-100 opacity-100'
                )}
            >
                <ArrowDown className="size-3 text-muted-foreground" />
            </button>
        </div>
    )
}
