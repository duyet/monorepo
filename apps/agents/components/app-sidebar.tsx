"use client"

import * as React from "react"
import { BarChart2, Plus, Sun, Moon, Search, FolderClosed, Grid2x2, Users, LayoutDashboard, PanelLeftClose } from "lucide-react"
import { useTheme } from "next-themes"

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
} | null = null;

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
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
            <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground mr-1">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 font-medium">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
            <button className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <FolderClosed className="h-4 w-4" />
              Assets
            </button>
            <button className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <Grid2x2 className="h-4 w-4" />
              Gallery
            </button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2 pt-4">MiniMax Lab</SidebarGroupLabel>
          <SidebarGroupContent>
             <button className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              MaxClaw <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">New</span>
            </button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2 pt-4">Experts</SidebarGroupLabel>
          <SidebarGroupContent>
             <button className="w-full flex items-center justify-start gap-3 text-sm h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <Users className="h-4 w-4" />
              Explore Experts <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">New</span>
            </button>
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
                     <button className="text-xs font-semibold px-2 py-1 rounded-md bg-foreground text-background">
                       Sign in
                     </button>
                   </ClerkComponents.SignInButton>
                 </ClerkComponents.SignedOut>
                 <ClerkComponents.SignedIn>
                   <div className="flex items-center gap-3">
                     <ClerkComponents.UserButton
                       appearance={{
                         elements: {
                           avatarBox: "h-8 w-8",
                         },
                       }}
                     />
                     <div className="flex flex-col">
                       <span className="text-sm font-medium">Duyet Le</span>
                       <span className="text-xs text-muted-foreground">Free</span>
                     </div>
                   </div>
                 </ClerkComponents.SignedIn>
               </>
             ) : (
               <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
             )}
           </div>
         </div>
      </SidebarFooter>
    </Sidebar>
  )
}
