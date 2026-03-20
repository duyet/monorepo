import { MessageSquare, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const groups = groupByDate(conversations);

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-2 py-1">
        {groups.map((group) => (
          <SidebarMenu key={group.label} className="mb-3">
            <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </p>
            {group.items.map((conv) => (
              <SidebarMenuItem key={conv.id}>
                <SidebarMenuButton
                  isActive={activeId === conv.id}
                  onClick={() => onSelect(conv.id)}
                  tooltip={conv.title}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  showOnHover
                  onClick={() => onDelete(conv.id)}
                  aria-label={`Delete conversation: ${conv.title}`}
                >
                  <Trash2 className="h-3 w-3" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
      </div>
    </ScrollArea>
  );
}
