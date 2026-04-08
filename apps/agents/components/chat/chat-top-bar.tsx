import {
  DownloadSimple as Download,
  FileCode as FileJson,
  FileText,
  Sidebar as PanelLeft,
  SidebarSimple as PanelRight,
  Plus,
  Sparkle as Sparkles,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { AuthControl } from "@/components/auth-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useExportConversation } from "@/lib/hooks/use-export-conversation";

interface ChatTopBarProps {
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  onNewChat: () => void;
  conversationTitle?: string;
  conversationId?: string;
  subtitle?: string;
}

export function ChatTopBar({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onNewChat,
  conversationTitle,
  conversationId,
  subtitle = "Workspace",
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
      <div className="flex min-h-[60px] items-center gap-2 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {onToggleLeftSidebar ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleLeftSidebar}
              aria-label="Open conversations"
              className="size-9 shrink-0"
            >
              <PanelLeft weight="regular" className="size-4" />
            </Button>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <Sparkles weight="fill" className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-medium sm:text-base">
                  {conversationTitle || "New chat"}
                </h1>
                <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                  {subtitle}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground/80">
                {conversationId ? "Conversation ready" : "Start a new thread"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onNewChat} className="h-9">
            <Plus data-icon="inline-start" weight="regular" className="size-4" />
            New
          </Button>

          {canExport ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isExporting}
                  size="icon"
                  variant="outline"
                  aria-label="Export conversation"
                  className="size-9 shrink-0"
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

          {onToggleRightSidebar ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleRightSidebar}
              aria-label="Open inspector"
              className="size-9 shrink-0"
            >
              <PanelRight weight="regular" className="size-4" />
            </Button>
          ) : null}

          <Separator
            orientation="vertical"
            className="mx-1 hidden h-6 md:block"
          />

          <AuthControl iconOnly className="size-9 shrink-0" />
        </div>
      </div>
    </header>
  );
}
