import { MessageSquarePlus, PanelLeftClose, Trash2 } from "lucide-react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
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
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(false);
    onDeleteAllConversations?.();
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b px-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2">
                <SidebarMenuButton
                  asChild
                  className="h-9 flex-1 justify-start gap-3 rounded-xl border bg-background px-3 shadow-sm"
                  tooltip="New conversation"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMobile(false);
                      onNewChat();
                    }}
                  >
                    <MessageSquarePlus />
                    <span className="font-medium">New chat</span>
                  </button>
                </SidebarMenuButton>

                <Button
                  aria-label="Toggle sidebar"
                  className="hidden h-9 w-9 rounded-xl lg:inline-flex"
                  size="icon"
                  variant="outline"
                  onClick={() => toggleSidebar()}
                >
                  <PanelLeftClose />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-3 py-3">
            <SidebarGroupContent>
              <div className="rounded-2xl border bg-muted/20 p-3">
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
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="mx-3 my-1" />

          <SidebarHistory
            conversations={conversations}
            activeId={activeId}
            isLoading={isLoading}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
          />
        </SidebarContent>

        <SidebarFooter className="border-t px-3 py-3">
          <SidebarUserNav />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

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
