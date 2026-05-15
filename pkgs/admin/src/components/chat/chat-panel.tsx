'use client'

import { useEffect } from 'react'

import { cn } from '@/lib/utils'
import { useChatPanelStore } from '@/stores/chat/chat-panel-store'

import { ChatHeader } from './chat-header'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'

export function ChatPanel() {
    const { isOpen, toggleOpen } = useChatPanelStore()

    // Handle Cmd+I keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault()
                toggleOpen()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleOpen])

    return (
        <div className="hidden md:block">
            <div
                className={cn(
                    'fixed inset-y-0 right-0 z-50 flex h-full w-96 flex-col border-l bg-background shadow-xl transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
                data-state={isOpen ? 'open' : 'closed'}
            >
                <div className="flex size-full flex-col overflow-hidden bg-background">
                    <ChatHeader />
                    <ChatMessageList />
                    <ChatInput />
                </div>
            </div>
        </div>
    )
}
