'use client'

import { MarkdownMenu } from './markdown-menu'

interface MarkdownMenuWrapperProps {
  markdownUrl: string
  markdownContent: string
}

export function MarkdownMenuWrapper({
  markdownUrl,
  markdownContent,
}: MarkdownMenuWrapperProps) {
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
    } catch (err) {
      console.error('Failed to copy markdown:', err)
    }
  }

  return (
    <MarkdownMenu
      markdownUrl={markdownUrl}
      onCopyMarkdown={handleCopyMarkdown}
    />
  )
}
