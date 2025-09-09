'use client'

import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface QueryInputProps {
  onSendMessage: (message: string) => void
  disabled: boolean
  placeholder: string
}

export function QueryInput({ onSendMessage, disabled, placeholder }: QueryInputProps) {
  const [query, setQuery] = useState('')

  const handleSend = () => {
    if (query.trim() && !disabled) {
      onSendMessage(query)
      setQuery('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          minHeight: '40px',
          maxHeight: '120px',
        }}
      />
      
      <button
        onClick={handleSend}
        disabled={disabled || !query.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        title="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}