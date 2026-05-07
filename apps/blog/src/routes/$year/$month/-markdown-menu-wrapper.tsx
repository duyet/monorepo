import { MarkdownMenu } from "./-markdown-menu";

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
      const textarea = document.createElement("textarea");
      textarea.value = markdownContent;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  return (
    <MarkdownMenu
      markdownUrl={markdownUrl}
      onCopyMarkdown={handleCopyMarkdown}
    />
  );
}
