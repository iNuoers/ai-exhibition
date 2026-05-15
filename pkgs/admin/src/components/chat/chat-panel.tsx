'use client'

import { useEffect } from 'react'

import { ChevronRight, Copy, CornerDownLeft, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useChatPanelStore } from '@/stores/chat/chat-panel-store'

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
                    'fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l bg-background transition-transform duration-300 ease-in-out sm:max-w-sm',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
                data-state={isOpen ? 'open' : 'closed'}
            >
                <div className="flex size-full w-full flex-col overflow-hidden whitespace-nowrap bg-background">
                    <div className="flex items-center justify-between px-4 py-2.5">
                        <h2 className="font-semibold text-sm">Chat</h2>
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <fieldset
                                    data-slot="button-group"
                                    data-orientation="horizontal"
                                    className="flex w-fit items-stretch"
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                disabled
                                            >
                                                <Copy className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy chat</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                disabled
                                            >
                                                <Trash className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Clear chat</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={toggleOpen}
                                            >
                                                <ChevronRight className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Close chat</TooltipContent>
                                    </Tooltip>
                                </fieldset>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="relative flex-1 overflow-y-auto p-4" role="log">
                        {/* Messages will go here */}
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                            No messages yet.
                        </div>
                    </div>

                    <div className="relative grid w-auto shrink-0 gap-4 p-4">
                        <p className="text-muted-foreground text-sm">
                            Tip: You can open and close chat with{' '}
                            <kbd className="pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm border bg-transparent px-1 font-medium font-sans text-muted-foreground text-xs">
                                ⌘
                            </kbd>
                            <kbd className="pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm border bg-transparent px-1 font-medium font-sans text-muted-foreground text-xs">
                                I
                            </kbd>
                        </p>
                        <form
                            className="w-full"
                            onSubmit={(e) => {
                                e.preventDefault()
                                // Handle submission
                            }}
                        >
                            <div className="group/input-group relative flex w-full flex-col overflow-hidden rounded-md border border-input shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
                                <textarea
                                    className="min-h-[60px] w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                                    placeholder="Type a message..."
                                />
                                <div className="flex h-auto w-full items-center justify-between gap-1 px-3 pb-3">
                                    <p className="text-muted-foreground text-xs">0 / 1000</p>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        aria-label="Submit"
                                    >
                                        <CornerDownLeft className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
