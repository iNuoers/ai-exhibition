import type { ChatMessage } from '@/lib/types'
import Markdown from './markdown'

interface ChatBubbleProps {
  message: ChatMessage
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
          🤖
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
            <Markdown>{message.content}</Markdown>
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-500" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
