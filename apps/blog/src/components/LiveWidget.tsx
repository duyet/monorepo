import { useEffect, useRef } from 'react'

interface LiveWidgetProps {
  html: string
  title?: string
  className?: string
  minHeight?: number
}

/**
 * LiveWidget - Securely renders interactive HTML widgets in sandboxed iframes
 *
 * Security model:
 * - Opaque-origin iframe via srcDoc (no allow-same-origin)
 * - Strict sandbox: allow-scripts allow-pointer-lock only
 * - postMessage validation: source check + shape validation
 * - Widget CSP enforced via meta tag (connect-src 'none')
 *
 * Height synchronization:
 * - Widget must include ResizeObserver script
 * - Posts { type: 'height', value: number } to parent
 * - Parent updates iframe height dynamically
 */
export function LiveWidget({
  html,
  title = 'Interactive widget',
  className = '',
  minHeight = 200
}: LiveWidgetProps) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    // Height synchronization via postMessage
    const onMessage = (e: MessageEvent) => {
      // SECURITY: Source check - only accept messages from this iframe
      if (e.source !== iframe.contentWindow) return

      const data = e.data

      // SECURITY: Validate message shape before acting
      // Prevents malformed/malicious message handling
      if (
        data === null ||
        typeof data !== 'object' ||
        !('type' in data) ||
        data.type !== 'height' ||
        !('value' in data) ||
        typeof data.value !== 'number'
      ) {
        return
      }

      // Update iframe height to match widget content
      iframe.style.height = `${data.value}px`
    }

    window.addEventListener('message', onMessage)

    // Cleanup listener on unmount
    return () => window.removeEventListener('message', onMessage)
  }, []) // Empty deps - handler ref doesn't change

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      sandbox="allow-scripts allow-pointer-lock"
      loading="lazy"
      className={`w-full border-0 ${className}`}
      title={title}
      style={{ height: '0', minHeight: `${minHeight}px` }}
    />
  )
}
