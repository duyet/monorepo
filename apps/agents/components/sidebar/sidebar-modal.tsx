import { Button } from "@duyet/components";
import { Plus } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Conversation } from "@/lib/types";
import { ConversationList } from "./conversation-list";

export interface SidebarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
}

export function SidebarModal({
  open,
  onOpenChange,
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 bg-white dark:bg-[#111] flex flex-col border-r border-border/50"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-3 space-y-0">
          <SheetTitle className="flex items-center justify-between text-left">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-base">
                Duyet Le
              </span>
              <span className="text-xs text-muted-foreground">Agent</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* New Task Button */}
        <div className="px-3 py-3 border-b border-border/50">
          <Button
            onClick={() => {
              onNewChat();
              onOpenChange(false);
            }}
            className="w-full justify-start"
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Task History */}
        <div className="flex-1 overflow-hidden flex flex-col px-3">
          <p className="px-1 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Task History
          </p>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={async (id) => {
              await onSelectConversation(id);
              onOpenChange(false);
            }}
            onDelete={onDeleteConversation}
          />
        </div>

        {/* User Section */}
        <div className="border-t border-border/50 p-3">
          <NavUser />
        </div>
      </SheetContent>
    </Sheet>
  );
}
