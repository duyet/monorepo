import { ChatCircle as MessageSquarePlus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { SidebarHistory } from "@/components/chat/sidebar-history";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Conversation } from "@/lib/types";

interface AppSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isLoading?: boolean;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onDeleteAllConversations?: () => void;
}

export function AppSidebar({
  conversations,
  activeId,
  isLoading = false,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onDeleteAllConversations,
}: AppSidebarProps) {
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(false);
    onDeleteAllConversations?.();
  };

  return (
    <>
      <div className="flex h-full flex-col bg-[#f8f8f2]">
        <div className="border-b border-[#1a1a1a]/15 px-4 py-4">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-start gap-3 rounded-lg bg-[#1a1a1a] px-4 py-3 text-white transition-colors hover:bg-[#444]"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-white/10">
              <MessageSquarePlus className="size-4" />
            </div>
            <span className="font-medium">New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-xl bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold tracking-tight">
                  Agent workspace
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Conversations, tools, and approvals
                </p>
              </div>
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>
            {onDeleteAllConversations && conversations.length > 0 ? (
              <Button
                className="mt-4 w-full justify-start gap-2 rounded-lg px-3"
                variant="ghost"
                onClick={() => setShowDeleteAllDialog(true)}
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-muted/50">
                  <Trash className="size-4" />
                </div>
                Delete all chats
              </Button>
            ) : null}
          </div>

          <Separator className="my-4 bg-[#1a1a1a]/15" />

          <SidebarHistory
            conversations={conversations}
            activeId={activeId}
            isLoading={isLoading}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
          />
        </div>

        <div className="border-t border-[#1a1a1a]/15 px-4 py-4">
          <SidebarUserNav />
        </div>
      </div>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently remove every
              conversation from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
