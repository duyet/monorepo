import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/types";
import { ChatItem } from "./sidebar-history-item";

interface GroupedChats {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  lastMonth: Conversation[];
  older: Conversation[];
}

const groupChatsByDate = (chats: Conversation[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.updatedAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

interface SidebarHistoryProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading: boolean;
  onSelectConversation: (id: string) => Promise<void> | void;
  onDeleteConversation: (id: string) => Promise<void> | void;
}

export function SidebarHistory({
  conversations,
  activeId,
  isLoading,
  onSelectConversation,
  onDeleteConversation,
}: SidebarHistoryProps) {
  const { setOpenMobile } = useSidebar();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const groupedChats = useMemo(
    () => groupChatsByDate(conversations),
    [conversations]
  );

  const groups = [
    { key: "today", label: "Today", chats: groupedChats.today },
    { key: "yesterday", label: "Yesterday", chats: groupedChats.yesterday },
    { key: "lastWeek", label: "Last 7 days", chats: groupedChats.lastWeek },
    { key: "lastMonth", label: "Last 30 days", chats: groupedChats.lastMonth },
    { key: "older", label: "Older", chats: groupedChats.older },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    setShowDeleteDialog(false);
    await onDeleteConversation(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden px-0 pb-3">
        <SidebarGroupLabel className="px-0 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          History
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <ScrollArea className="h-[calc(100svh-15rem)]">
            <SidebarMenu className="flex flex-col gap-3 pr-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="h-11 animate-pulse rounded-lg bg-white"
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1a1a1a]/20 bg-white px-4 py-5 text-sm font-medium text-muted-foreground">
                  Your conversations will appear here after you start chatting.
                </div>
              ) : (
                groups.map(
                  (group) =>
                    group.chats.length > 0 && (
                      <div key={group.key} className="space-y-2">
                        <div className="px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {group.label}
                        </div>
                        <div className="space-y-1">
                          {group.chats.map((chat) => (
                            <ChatItem
                              chat={chat}
                              isActive={chat.id === activeId}
                              key={chat.id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteDialog(true);
                              }}
                              onSelect={(id) => {
                                setOpenMobile(false);
                                onSelectConversation(id);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )
                )
              )}
            </SidebarMenu>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation will be removed
              from your workspace and server storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
