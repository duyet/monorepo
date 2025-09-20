'use client'

import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
  onRetry: (messageId: string) => void
  isLoading: boolean
}

export function MessageList({ messages, onRetry, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRetry={() => onRetry(message.id)}
          canRetry={!isLoading && message.role === 'assistant' && !message.isLoading}
        />
      ))}
    </div>
  )
}