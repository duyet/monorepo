"use client";

import { Button } from "@duyet/components";
import { cn } from "@duyet/libs";
import { PanelLeftClose, Plus } from "lucide-react";
import type * as React from "react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/types";
import { ConversationList } from "./sidebar/conversation-list";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onCloseSidebar?: () => void;
}

export function AppSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onCloseSidebar,
  className,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className={cn("border-r-0 bg-white dark:bg-[#111]", className)}
      {...props}
    >
      <SidebarHeader className="border-b border-border/50 pb-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <a
                href="/"
                className="flex items-center gap-2 overflow-hidden px-1"
              >
                <div className="flex flex-col flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold text-foreground">
                    Duyet Le
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Agent
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
            {onCloseSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseSidebar}
                aria-label="Close sidebar"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground mr-1"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 font-medium">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewChat}
                  tooltip="New Task"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Task</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="flex-1 overflow-hidden flex flex-col">
          <SidebarGroupLabel>
            Task History
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
