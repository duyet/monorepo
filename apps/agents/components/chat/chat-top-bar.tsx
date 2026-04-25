import {
  DownloadSimple as Download,
  FileCode as FileJson,
  FileText,
  List,
  Plus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { AuthControl } from "@/components/auth-control";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportConversation } from "@/lib/hooks/use-export-conversation";

interface ChatTopBarProps {
  onNewChat: () => void;
  conversationTitle?: string;
  conversationId?: string;
  onOpenSidebar?: () => void;
}

export function ChatTopBar({
  onNewChat,
  conversationTitle,
  conversationId,
  onOpenSidebar,
}: ChatTopBarProps) {
  const { exportConversation, isExporting } = useExportConversation();
  const canExport = Boolean(conversationId);

  const handleExport = async (format: "json" | "md" | "txt") => {
    if (!conversationId) return;

    try {
      await exportConversation({ conversationId, format });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to export conversation";
      toast.error(message);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-2 px-4">
        {onOpenSidebar ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="md:hidden size-9 shrink-0 rounded-full"
          >
            <List weight="regular" className="size-4" />
          </Button>
        ) : null}
        <div className="flex min-w-0 flex-1 items-center">
          <h1 className="truncate text-sm font-medium">
            {conversationTitle || "New chat"}
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onNewChat} className="h-9 rounded-full">
            <Plus weight="regular" className="size-4" />
          </Button>

          {canExport ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isExporting}
                  size="icon"
                  variant="ghost"
                  aria-label="Export conversation"
                  className="size-9 shrink-0 rounded-full"
                >
                  <Download weight="regular" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void handleExport("json")}>
                  <FileJson data-icon="inline-start" weight="regular" className="size-4" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExport("md")}>
                  <FileText data-icon="inline-start" weight="regular" className="size-4" />
                  Export Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleExport("txt")}>
                  <Download data-icon="inline-start" weight="regular" className="size-4" />
                  Export text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <AuthControl iconOnly className="size-9 shrink-0 rounded-full" />
        </div>
      </div>
    </header>
  );
}
