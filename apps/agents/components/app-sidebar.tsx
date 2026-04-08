import { MessageSquarePlus, Trash2 } from "lucide-react";
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
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-start gap-3 rounded-xl border bg-background px-4 py-2.5 shadow-sm transition-colors hover:bg-muted/50"
        >
          <MessageSquarePlus />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Agent workspace</p>
              <p className="text-xs text-muted-foreground">
                Conversations, tools, and approvals
              </p>
            </div>
            <Badge variant="secondary">{conversations.length}</Badge>
          </div>
          {onDeleteAllConversations && conversations.length > 0 ? (
            <Button
              className="mt-3 w-full justify-start rounded-xl"
              variant="ghost"
              onClick={() => setShowDeleteAllDialog(true)}
            >
              <Trash2 />
              Delete all chats
            </Button>
          ) : null}
        </div>

        <Separator className="my-4" />

        <SidebarHistory
          conversations={conversations}
          activeId={activeId}
          isLoading={isLoading}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </div>

      <div className="border-t px-4 py-4">
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
