'use client'

import type { ReactNode } from 'react'

import { SidebarInset } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useChatPanelStore } from '@/stores/chat/chat-panel-store'

export function InsetWrapper({
    children,
    className
}: { children: ReactNode; className?: string }) {
    const { isOpen } = useChatPanelStore()

    return (
        <SidebarInset
            className={cn('transition-[margin] duration-300 ease-in-out', isOpen && 'md:mr-98!', className)}
        >
            {children}
        </SidebarInset>
    )
}