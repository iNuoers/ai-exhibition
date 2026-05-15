import { ChevronRight, Copy, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useChatPanelStore } from '@/stores/chat/chat-panel-store'
import { useChatStore } from '@/stores/chat/chat-store'

export function ChatHeader() {
    const { toggleOpen } = useChatPanelStore()
    const { clearMessages } = useChatStore()

    return (
        <div className="flex items-center justify-between px-4 py-2.5">
            <h2 className="mr-2 font-semibold text-sm">Chat</h2>

            <div className="flex items-center gap-3">
                <TooltipProvider>
                    <fieldset
                        data-slot="button-group"
                        data-orientation="horizontal"
                        className="flex w-fit items-stretch"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" disabled>
                                    <Copy className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy chat</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" onClick={clearMessages}>
                                    <Trash className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear chat</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" onClick={toggleOpen}>
                                    <ChevronRight className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Close chat (Cmd+I)</TooltipContent>
                        </Tooltip>
                    </fieldset>
                </TooltipProvider>
            </div>
        </div>
    )
}
