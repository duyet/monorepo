import { cn } from "@duyet/libs/utils";
import { Check, ChevronUp, Copy, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MarkdownMenuProps {
  markdownUrl: string;
  onCopyMarkdown: () => Promise<void>;
}

function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.709 15.955l4.397-2.398a.693.693 0 0 0 .257-.942.685.685 0 0 0-.936-.26L4.03 14.754a.693.693 0 0 0-.257.942c.19.334.603.449.936.26zM6.762 18.588l2.248-4.093a.693.693 0 0 0-.257-.942.685.685 0 0 0-.936.26L5.57 17.905a.693.693 0 0 0 .257.942.685.685 0 0 0 .936-.26zM10.063 19.6l.66-4.61a.69.69 0 0 0-.584-.784.69.69 0 0 0-.78.588l-.66 4.61a.69.69 0 0 0 .584.784.69.69 0 0 0 .78-.588zM13.294 19.782a.69.69 0 0 0 .78-.588l.66-4.61a.69.69 0 0 0-.584-.784.69.69 0 0 0-.78.588l-.66 4.61a.69.69 0 0 0 .584.784zM16.307 18.812a.685.685 0 0 0 .936-.26l2.248-4.093a.693.693 0 0 0-.257-.942.685.685 0 0 0-.936.26l-2.248 4.093a.693.693 0 0 0 .257.942zM19.034 15.694c.333.19.746.074.936-.26a.693.693 0 0 0-.257-.942l-4.397-2.398a.685.685 0 0 0-.936.26.693.693 0 0 0 .257.942l4.397 2.398zM16.98 5.412l-4.397 2.398a.693.693 0 0 0-.257.942c.19.334.603.449.936.26l4.397-2.399a.693.693 0 0 0 .257-.942.685.685 0 0 0-.936-.26zM14.927 2.779L12.68 6.872a.693.693 0 0 0 .257.942c.333.19.746.074.936-.26l2.248-4.093a.693.693 0 0 0-.257-.942.685.685 0 0 0-.936.26zM11.626 1.767l-.66 4.61a.69.69 0 0 0 .584.784.69.69 0 0 0 .78-.588l.66-4.61a.69.69 0 0 0-.584-.784.69.69 0 0 0-.78.588zM8.395 1.585a.69.69 0 0 0-.78.588l-.66 4.61a.69.69 0 0 0 .584.784.69.69 0 0 0 .78-.588l.66-4.61a.69.69 0 0 0-.584-.784zM5.382 2.555a.685.685 0 0 0-.936.26L2.198 6.908a.693.693 0 0 0 .257.942c.333.19.746.074.936-.26l2.248-4.093a.693.693 0 0 0-.257-.942zM2.655 5.673a.685.685 0 0 0-.936.26.693.693 0 0 0 .257.942l4.397 2.398a.685.685 0 0 0 .936-.26.693.693 0 0 0-.257-.942L2.655 5.673z" />
    </svg>
  );
}

export function MarkdownMenu({
  markdownUrl,
  onCopyMarkdown,
}: MarkdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    await onCopyMarkdown();
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : markdownUrl;

  const menuItems = [
    {
      icon: copied ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <Copy className="h-5 w-5 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55" />
      ),
      label: copied ? "Copied!" : "Copy page",
      description: "Copy page as Markdown for LLMs",
      onClick: handleCopy,
    },
    {
      icon: <FileText className="h-5 w-5 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55" />,
      label: "View as Markdown",
      description: "View this page as plain text",
      href: markdownUrl,
    },
    {
      icon: <ChatGPTIcon className="h-5 w-5 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55" />,
      label: "Open in ChatGPT",
      description: "Ask questions about this page",
      href: `https://chatgpt.com/?q=${encodeURIComponent(`Read and summarize this blog post: ${pageUrl}`)}`,
    },
    {
      icon: <ClaudeIcon className="h-5 w-5 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55" />,
      label: "Open in Claude",
      description: "Ask questions about this page",
      href: `https://claude.ai/new?q=${encodeURIComponent(`Read and summarize this blog post: ${pageUrl}`)}`,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
          "border border-[#1a1a1a]/10 dark:border-white/10",
          "hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a]",
          "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70",
          "transition-colors"
        )}
      >
        <Copy className="h-3.5 w-3.5" />
        <span>Copy page</span>
        <ChevronUp
          className={cn(
            "h-3 w-3 transition-transform",
            !isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 bottom-full mb-2 w-72 z-50",
            "rounded-xl border border-[#1a1a1a]/10 dark:border-white/10",
            "bg-white dark:bg-[#1a1a1a]",
            "shadow-lg",
            "overflow-hidden",
            "py-1"
          )}
        >
          {menuItems.map((item) => {
            const content = (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="text-sm font-medium text-[#1a1a1a] dark:text-[#f8f8f2] flex items-center gap-1">
                    {item.label}
                    {item.href && (
                      <span className="text-[#1a1a1a]/35 dark:text-[#f8f8f2]/35 text-xs">&#x2197;</span>
                    )}
                  </div>
                  <div className="text-xs text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full text-left hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  {content}
                </button>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a]/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {content}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
