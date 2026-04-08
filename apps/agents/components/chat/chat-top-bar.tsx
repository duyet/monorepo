import {
  Download,
  FileJson,
  FileText,
  PanelLeft,
  PanelRight,
  Plus,
  Sparkles,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExportConversation } from "@/lib/hooks/use-export-conversation";
import type { ChatMode } from "@/lib/types";

interface ChatTopBarProps {
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  onNewChat: () => void;
  conversationTitle?: string;
  conversationId?: string;
  subtitle?: string;
  mode?: ChatMode;
  onModeChange?: (mode: ChatMode) => void;
}

export function ChatTopBar({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onNewChat,
  conversationTitle,
  conversationId,
  subtitle = "Workspace",
  mode,
  onModeChange,
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
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onToggleLeftSidebar ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onToggleLeftSidebar}
              aria-label="Open conversations"
            >
              <PanelLeft />
            </Button>
          ) : null}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold sm:text-base">
                  {conversationTitle || "New chat"}
                </h1>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {subtitle}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {conversationId ? "Conversation ready" : "Start a new thread"}
              </p>
            </div>
          </div>
        </div>

        {mode && onModeChange ? (
          <Tabs
            className="hidden md:block"
            value={mode}
            onValueChange={(value) => onModeChange(value as ChatMode)}
          >
            <TabsList className="h-10 rounded-full border bg-muted/50 p-1">
              <TabsTrigger className="rounded-full px-3" value="fast">
                Fast
              </TabsTrigger>
              <TabsTrigger className="rounded-full px-3" value="agent">
                Agent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onNewChat}>
            <Plus data-icon="inline-start" />
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
                >
                  <Download />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void handleExport("json")}>
                  <FileJson data-icon="inline-start" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExport("md")}>
                  <FileText data-icon="inline-start" />
                  Export Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleExport("txt")}>
                  <Download data-icon="inline-start" />
                  Export text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {onToggleRightSidebar ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onToggleRightSidebar}
              aria-label="Open inspector"
            >
              <PanelRight />
            </Button>
          ) : null}

          <Separator
            orientation="vertical"
            className="mx-1 hidden h-8 md:block"
          />

          <AuthControl iconOnly className="h-9 w-9" />
        </div>
      </div>
    </header>
  );
}
