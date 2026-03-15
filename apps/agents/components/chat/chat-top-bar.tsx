"use client";

import { Badge, Button } from "@duyet/components";
import { AuthButtons } from "@duyet/components/header/AuthButtons";
import {
  Activity,
  Download,
  FileJson,
  FileText,
  Menu,
  MoreHorizontal,
  Plus,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useExportConversation } from "@/lib/hooks/use-export-conversation";
import { SettingsDialog } from "../settings/settings-dialog";

interface ChatTopBarProps {
  onToggleActivity: () => void;
  onToggleTools?: () => void;
  onToggleMenu?: () => void;
  onNewChat: () => void;
  showActivityButton: boolean;
  activityCount: number;
  conversationTitle?: string;
  conversationId?: string;
}

// Export format options configuration
const EXPORT_FORMATS = [
  { format: "json", label: "Export as JSON", icon: FileJson },
  { format: "md", label: "Export as Markdown", icon: FileText },
  { format: "txt", label: "Export as Text", icon: FileText },
] as const;

export function ChatTopBar({
  onToggleActivity,
  onToggleTools,
  onToggleMenu,
  onNewChat,
  showActivityButton,
  activityCount,
  conversationTitle,
  conversationId,
}: ChatTopBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    <>
      <div className="absolute top-0 w-full z-10 flex h-14 items-center justify-between bg-transparent flex-shrink-0 px-2 sm:px-4 py-2">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center gap-2">
          {onToggleMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMenu}
              aria-label="Open sidebar"
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center text-sm font-semibold tracking-tight text-foreground gap-2">
            <span>{conversationTitle || "New Task"}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Conversation actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onNewChat}
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Chat</span>
            </Button>

            {onToggleTools && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleTools}
                aria-label="Open tools panel"
              >
                <Wrench className="h-4 w-4" />
                <span className="sr-only">Tools</span>
              </Button>
            )}

            {canExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isExporting}
                    aria-label="Export conversation"
                  >
                    <Download
                      className={`h-4 w-4 ${isExporting ? "animate-pulse" : ""}`}
                    />
                    <span className="sr-only">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {EXPORT_FORMATS.map(({ format, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={format}
                      onClick={() =>
                        handleExport(format as "json" | "md" | "txt")
                      }
                      disabled={isExporting}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Separator between conversation and panel actions */}
          <Separator orientation="vertical" className="h-6" />

          {/* Panel actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>

            {showActivityButton && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 relative"
                onClick={onToggleActivity}
                aria-label="Toggle activity panel"
              >
                <Activity className="h-4 w-4" />
                {activityCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] rounded-full"
                  >
                    {activityCount > 9 ? "9+" : activityCount}
                  </Badge>
                )}
                <span className="sr-only">Toggle activity</span>
              </Button>
            )}
          </div>

          {/* Separator before auth */}
          <Separator orientation="vertical" className="h-6" />

          {/* Auth */}
          <AuthButtons
            signInClassName="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            avatarSize="h-7 w-7"
            wrapWithProvider={false}
          />
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
