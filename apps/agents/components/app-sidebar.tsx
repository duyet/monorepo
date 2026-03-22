import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/types";

interface AppSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
}

function groupByDate(conversations: Conversation[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Older", items: [] },
  ];

  for (const conv of conversations) {
    if (conv.updatedAt >= today.getTime()) {
      groups[0].items.push(conv);
    } else if (conv.updatedAt >= yesterday.getTime()) {
      groups[1].items.push(conv);
    } else {
      groups[2].items.push(conv);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export function AppSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const groups = groupByDate(conversations);

  return (
    <Sidebar collapsible="icon" className="border-r bg-background">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="space-y-1 px-2 pb-1 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            History
          </p>
          <p className="text-sm text-foreground">Recent conversations</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewChat}
              tooltip="New Chat"
              className="font-medium"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center group-data-[collapsible=icon]:hidden">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                No conversations yet
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map((conv) => (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton
                        isActive={activeId === conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        tooltip={conv.title}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 truncate">{conv.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        showOnHover
                        onClick={() => onDeleteConversation(conv.id)}
                        aria-label={`Delete conversation: ${conv.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t px-2 py-3">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
