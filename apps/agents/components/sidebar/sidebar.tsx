"use client";

import type { Conversation, ChatMode } from "@/lib/types";
import { ConversationList } from "./conversation-list";
import { Button } from "@duyet/components";
import { Plus, PanelLeftClose, PanelLeft, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex h-full flex-col bg-muted/30 border-r border-border")}>
      {/* Top: New Chat + collapse */}
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 text-sm h-9"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
        />
      </div>

      {/* Bottom: theme toggle + keyboard hints */}
      <div className="border-t border-border p-2 space-y-2">
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)]">
            ⌘K focus · Esc stop
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
