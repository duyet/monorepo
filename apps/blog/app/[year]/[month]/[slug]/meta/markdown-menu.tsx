'use client'

import { useState } from 'react'
import { cn } from '@duyet/libs/utils'

interface MarkdownMenuProps {
  markdownUrl: string
  onCopyMarkdown: () => Promise<void>
}

export function MarkdownMenu({ markdownUrl, onCopyMarkdown }: MarkdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopyMarkdown()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-neutral-500 transition-colors hover:text-neutral-900"
        title="Markdown options"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
        <span className="text-xs">Markdown</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="py-1">
              <button
                onClick={handleCopy}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm text-left',
                  'text-neutral-700 hover:bg-neutral-100',
                  'dark:text-neutral-300 dark:hover:bg-neutral-800',
                )}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
              <a
                href={markdownUrl}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm',
                  'text-neutral-700 hover:bg-neutral-100',
                  'dark:text-neutral-300 dark:hover:bg-neutral-800',
                )}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View as Markdown
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
