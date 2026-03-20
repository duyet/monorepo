import { MarkdownMenu } from "./markdown-menu";

interface MarkdownMenuWrapperProps {
  markdownUrl: string;
  markdownContent: string;
}

export function MarkdownMenuWrapper({
  markdownUrl,
  markdownContent,
}: MarkdownMenuWrapperProps) {
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
    } catch {
      // Clipboard access denied or unavailable
    }
  };

  return (
    <MarkdownMenu
      markdownUrl={markdownUrl}
      onCopyMarkdown={handleCopyMarkdown}
    />
  );
}
