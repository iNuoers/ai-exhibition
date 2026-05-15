import { create } from 'zustand'

interface ChatPanelState {
    isOpen: boolean
    activeSessionId: string | null
    setIsOpen: (isOpen: boolean) => void
    toggleOpen: () => void
    setActiveSessionId: (id: string | null) => void
}

export const useChatPanelStore = create<ChatPanelState>((set) => ({
    isOpen: false,
    activeSessionId: null,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setActiveSessionId: (activeSessionId) => set({ activeSessionId })
}))
