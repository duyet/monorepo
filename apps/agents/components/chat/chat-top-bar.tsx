import { Download, FileJson, FileText, PanelRight, Plus } from "lucide-react";
import { AuthControl } from "@/components/auth-control";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useExportConversation } from "@/lib/hooks/use-export-conversation";

interface ChatTopBarProps {
  onToggleRightSidebar?: () => void;
  onNewChat: () => void;
  conversationTitle?: string;
  conversationId?: string;
}

export function ChatTopBar({
  onToggleRightSidebar,
  onNewChat,
  conversationTitle,
  conversationId,
}: ChatTopBarProps) {
  const { exportConversation, isExporting } = useExportConversation();

  const handleExport = async (format: "json" | "md" | "txt") => {
    if (!conversationId) return;
    try {
      await exportConversation({ conversationId, format });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const canExport = Boolean(conversationId);

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center border-b bg-background/95 px-3 backdrop-blur sm:px-4">
      <div className="flex items-center gap-2">
        <div className="lg:hidden">
          <SidebarTrigger className="-ml-1" />
        </div>
        <Separator orientation="vertical" className="hidden h-4 lg:block" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {conversationTitle || "New chat"}
          </p>
          <p className="text-xs text-muted-foreground">Agent workspace</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
          New
        </Button>

        {canExport && (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={isExporting}
              onClick={() => handleExport("json")}
              aria-label="Export as JSON"
            >
              <FileJson className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isExporting}
              onClick={() => handleExport("md")}
              aria-label="Export as Markdown"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isExporting}
              onClick={() => handleExport("txt")}
              aria-label="Export as Text"
            >
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}

        {onToggleRightSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleRightSidebar}
            aria-label="Open details"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}

        <Separator orientation="vertical" className="h-6" />

        <AuthControl iconOnly className="h-8 w-8" />
      </div>
    </header>
  );
}
