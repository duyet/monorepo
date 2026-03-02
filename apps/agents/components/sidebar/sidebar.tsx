"use client";

import { Button } from "@duyet/components";
import {
  BarChart2,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/** Collapsed rail — thin strip with icon buttons */
function SidebarRail({
  onNewChat,
  onToggleCollapse,
}: {
  onNewChat: () => void;
  onToggleCollapse: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-full w-12 flex-col items-center bg-muted/30 border-r border-border py-2 gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onToggleCollapse}
      >
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Expand sidebar</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onNewChat}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">New chat</span>
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <a href="/analytics" className="w-full flex justify-center">
        <Button variant="ghost" size="icon" className="h-9 w-9 mt-1">
          <BarChart2 className="h-4 w-4" />
          <span className="sr-only">Analytics</span>
        </Button>
      </a>
    </div>
  );
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

  if (collapsed) {
    return (
      <SidebarRail onNewChat={onNewChat} onToggleCollapse={onToggleCollapse} />
    );
  }

  return (
    <div
      className={cn("flex h-full flex-col bg-muted/30 border-r border-border")}
    >
      {/* Top: New Chat */}
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

      {/* Bottom: theme toggle + analytics + hints */}
      <div className="border-t border-border p-2 space-y-2">
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-muted-foreground font-[family-name:var(--font-geist-mono)]">
            ⌘K focus · Esc stop
          </p>
          <div className="flex gap-1 items-center">
            <a href="/analytics">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <BarChart2 className="h-3.5 w-3.5" />
                <span className="sr-only">Analytics</span>
              </Button>
            </a>
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
    </div>
  );
}
