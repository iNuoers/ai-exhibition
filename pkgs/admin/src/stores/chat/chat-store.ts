import { create } from 'zustand'

export type FileAttachment = {
    id: string
    file: File
    url: string
    type: 'image' | 'document' | 'other'
    name: string
}

export type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    reasoning?: string
    attachments?: FileAttachment[]
    createdAt: Date
}

interface ChatState {
    messages: Message[]
    selectedModel: string
    stagedFiles: FileAttachment[]
    isTyping: boolean
    inputValue: string
    editingMessageId: string | null

    // Actions
    setSelectedModel: (model: string) => void
    addMessage: (message: Message) => void
    updateMessage: (id: string, updates: Partial<Message>) => void
    setStagedFiles: (files: FileAttachment[] | ((prev: FileAttachment[]) => FileAttachment[])) => void
    removeStagedFile: (id: string) => void
    clearStagedFiles: () => void
    setIsTyping: (isTyping: boolean) => void
    clearMessages: () => void
    setInputValue: (value: string) => void
    setEditingMessageId: (id: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    selectedModel: 'gpt-4o',
    stagedFiles: [],
    isTyping: false,
    inputValue: '',
    editingMessageId: null,

    setSelectedModel: (model) => set({ selectedModel: model }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    updateMessage: (id, updates) =>
        set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m))
        })),
    setStagedFiles: (files) =>
        set((state) => ({
            stagedFiles: typeof files === 'function' ? files(state.stagedFiles) : files
        })),
    removeStagedFile: (id) =>
        set((state) => {
            const file = state.stagedFiles.find((f) => f.id === id)
            // Memory Leak Prevention:
            // When a staged file is removed, we must revoke the ObjectURL
            // created by URL.createObjectURL to free up browser memory.
            if (typeof window !== 'undefined' && file?.url?.startsWith('blob:')) {
                URL.revokeObjectURL(file.url)
            }
            return {
                stagedFiles: state.stagedFiles.filter((f) => f.id !== id)
            }
        }),
    clearStagedFiles: () =>
        set((state) => {
            // Memory Leak Prevention:
            // Revoke all Blob URLs before clearing the array.
            if (typeof window !== 'undefined') {
                for (const file of state.stagedFiles) {
                    if (file.url?.startsWith('blob:')) {
                        URL.revokeObjectURL(file.url)
                    }
                }
            }
            return { stagedFiles: [] }
        }),
    setIsTyping: (isTyping) => set({ isTyping }),
    clearMessages: () => set({ messages: [] }),
    setInputValue: (value) => set({ inputValue: value }),
    setEditingMessageId: (id) => set({ editingMessageId: id })
}))
