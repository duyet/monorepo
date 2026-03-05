"use client"

import * as React from "react"
import { BarChart2, Plus, Sun, Moon, Search, FolderClosed, Grid2x2, Users, LayoutDashboard, PanelLeftClose } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@duyet/components"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { ConversationList } from "./sidebar/conversation-list"
import { Conversation } from "@/lib/types"

let ClerkComponents: {
  SignInButton: React.ComponentType<{
    mode?: string;
    children: React.ReactNode;
  }>;
  SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  UserButton: React.ComponentType<{ appearance?: Record<string, unknown> }>;
  useUser: () => { isLoaded: boolean; isSignedIn: boolean; user: any };
} | null = null;

function UserProfile() {
  if (!ClerkComponents || !ClerkComponents.useUser) return null;
  const { user, isLoaded } = ClerkComponents.useUser();
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
  ...props 
}: AppSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [clerkLoaded, setClerkLoaded] = React.useState(false);

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      import("@clerk/clerk-react").then((mod) => {
        ClerkComponents = {
          SignInButton: mod.SignInButton as any,
          SignedIn: mod.SignedIn as any,
          SignedOut: mod.SignedOut as any,
          UserButton: mod.UserButton as any,
          useUser: mod.useUser as any,
        };
        setClerkLoaded(true);
      });
    }
  }, []);

  return (
    <Sidebar variant="inset" {...props} className="border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <span className="font-bold text-lg">D</span>
                </div>
              </a>
            </SidebarMenuButton>
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onCloseSidebar}
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
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2">Task History</SidebarGroupLabel>
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
             {clerkLoaded && ClerkComponents ? (
               <>
                 <ClerkComponents.SignedOut>
                   <ClerkComponents.SignInButton mode="modal">
                     <Button variant="default" size="sm" className="h-8 text-xs font-semibold px-3">
                       Sign in
                     </Button>
                   </ClerkComponents.SignInButton>
                 </ClerkComponents.SignedOut>
                 <ClerkComponents.SignedIn>
                   <div className="flex items-center gap-3 w-full">
                     <ClerkComponents.UserButton
                       appearance={{
                         elements: {
                           avatarBox: "h-8 w-8",
                         },
                       }}
                     />
                     <UserProfile />
                   </div>
                 </ClerkComponents.SignedIn>
               </>
             ) : (
               <Button variant="default" size="sm" className="h-8 text-xs font-semibold px-3 pointer-events-none opacity-50">
                 Sign in
               </Button>
             )}
           </div>
         </div>
      </SidebarFooter>
    </Sidebar>
  )
}
