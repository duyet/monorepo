"use client";

import { Button } from "@duyet/components";
import { cn } from "@duyet/libs/utils";
import { PanelLeftClose, Plus } from "lucide-react";
import type * as React from "react";
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
} from "@/components/ui/sidebar";
import {
  type ClerkComponents,
  useClerkComponents,
} from "@/lib/hooks/use-clerk-components";
import type { Conversation } from "@/lib/types";
import { ConversationList } from "./sidebar/conversation-list";

function UserProfile() {
  const clerk = useClerkComponents();
  if (!clerk) return null;
  return <UserProfileInner useUser={clerk.useUser} />;
}

function UserProfileInner({
  useUser,
}: {
  useUser: ClerkComponents["useUser"];
}) {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  const plan = user.publicMetadata?.plan || "Free";
  const name = user.fullName || user.firstName || "User";

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{String(plan)}</span>
    </div>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onCloseSidebar?: () => void;
  onSearch?: () => void;
  onOpenAssets?: () => void;
  onOpenGallery?: () => void;
  onOpenMaxClaw?: () => void;
  onExploreExperts?: () => void;
}

export function AppSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onCloseSidebar,
  onSearch: _onSearch,
  onOpenAssets: _onOpenAssets,
  onOpenGallery: _onOpenGallery,
  onOpenMaxClaw: _onOpenMaxClaw,
  onExploreExperts: _onExploreExperts,
  className,
  ...rest
}: AppSidebarProps) {
  const clerk = useClerkComponents();

  return (
    <Sidebar variant="inset" {...rest} className={cn("border-r-0", className)}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <span className="font-bold text-lg">D</span>
                </div>
              </a>
            </SidebarMenuButton>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseSidebar}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground mr-1"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 font-medium">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <Button
              variant="ghost"
              onClick={onNewChat}
              className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-medium border-0 shadow-none"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 overflow-hidden flex flex-col pt-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2">
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

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {clerk ? (
              <>
                <clerk.SignedOut>
                  <clerk.SignInButton mode="modal">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 text-xs font-semibold px-3"
                    >
                      Sign in
                    </Button>
                  </clerk.SignInButton>
                </clerk.SignedOut>
                <clerk.SignedIn>
                  <div className="flex items-center gap-3 w-full">
                    <clerk.UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />
                    <UserProfile />
                  </div>
                </clerk.SignedIn>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs font-semibold px-3 pointer-events-none opacity-50"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
