export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No layout wrapper for markdown pages - just return raw content
  return children
}
