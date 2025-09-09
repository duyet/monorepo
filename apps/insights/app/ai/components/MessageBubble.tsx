'use client'

import { RefreshCw, User, Bot } from 'lucide-react'
import type { ChatMessage } from '../types'
import { LoadingIndicator } from './LoadingIndicator'

interface MessageBubbleProps {
  message: ChatMessage
  onRetry: () => void
  canRetry: boolean
}

export function MessageBubble({ message, onRetry, canRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingIndicator size="sm" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        )}
        
        {!message.isLoading && (
          <div className="mt-2 flex items-center justify-between text-xs opacity-60">
            <span>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            
            {canRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 hover:opacity-100"
                title="Retry message"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      )}
    </div>
  )
}