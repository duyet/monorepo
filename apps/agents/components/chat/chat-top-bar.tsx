"use client";

import { Button } from "@duyet/components";
import { Activity, Plus, Share, MoreHorizontal, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

let ClerkComponents: {
  SignInButton: React.ComponentType<{
    mode?: string;
    children: React.ReactNode;
  }>;
  SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  UserButton: React.ComponentType<{ appearance?: Record<string, unknown> }>;
} | null = null;

interface ChatTopBarProps {
  onToggleActivity: () => void;
  onToggleTools?: () => void;
  onNewChat: () => void;
  showActivityButton: boolean;
  activityCount: number;
  conversationTitle?: string;
}

import { SettingsDialog } from "../settings/settings-dialog";

export function ChatTopBar({
  onToggleActivity,
  onToggleTools,
  onNewChat,
  showActivityButton,
  activityCount,
  conversationTitle,
}: ChatTopBarProps) {
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Dynamically import Clerk only on client when key is available
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      import("@clerk/clerk-react").then((mod) => {
        ClerkComponents = {
          SignInButton: mod.SignInButton as typeof ClerkComponents extends null
            ? never
            : NonNullable<typeof ClerkComponents>["SignInButton"],
          SignedIn: mod.SignedIn as typeof ClerkComponents extends null
            ? never
            : NonNullable<typeof ClerkComponents>["SignedIn"],
          SignedOut: mod.SignedOut as typeof ClerkComponents extends null
            ? never
            : NonNullable<typeof ClerkComponents>["SignedOut"],
          UserButton: mod.UserButton as typeof ClerkComponents extends null
            ? never
            : NonNullable<typeof ClerkComponents>["UserButton"],
        };
        setClerkLoaded(true);
      });
    }
  }, []);

  return (
    <>
      <div className="absolute top-0 w-full z-10 flex h-14 items-center justify-between bg-transparent px-4 py-2">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center gap-3">
           <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/50 text-foreground">
             <LayoutDashboard className="h-4 w-4 text-blue-500" />
           </div>
           <div className="flex items-center text-sm font-semibold tracking-tight text-foreground gap-2">
             <span>Icon Maker</span>
             <span className="text-muted-foreground font-normal">{conversationTitle || "New Task"}</span>
           </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md shadow-sm bg-background"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md shadow-sm bg-background"
            onClick={() => onToggleTools?.()}
          >
             <Share className="h-4 w-4" />
             <span className="sr-only">Share</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md shadow-sm bg-background"
            onClick={() => setSettingsOpen(true)}
          >
             <MoreHorizontal className="h-4 w-4" />
             <span className="sr-only">More</span>
          </Button>

          {showActivityButton && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 relative text-muted-foreground hover:text-foreground rounded-md shadow-sm bg-background ml-1"
              onClick={onToggleActivity}
            >
              <Activity className="h-4 w-4" />
              {activityCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {activityCount > 9 ? "9+" : activityCount}
                </span>
              )}
              <span className="sr-only">Toggle activity</span>
            </Button>
          )}
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
