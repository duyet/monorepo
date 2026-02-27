"use client";

import { Button } from "@duyet/components";
import { Menu, Activity, PenSquare, User } from "lucide-react";
import { useEffect, useState } from "react";

let ClerkComponents: {
  SignInButton: React.ComponentType<{ mode?: string; children: React.ReactNode }>;
  SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  UserButton: React.ComponentType<{ appearance?: Record<string, unknown> }>;
} | null = null;

interface ChatTopBarProps {
  onToggleSidebar: () => void;
  onToggleActivity: () => void;
  onNewChat: () => void;
  showActivityButton: boolean;
  activityCount: number;
  conversationTitle?: string;
}

export function ChatTopBar({
  onToggleSidebar,
  onToggleActivity,
  onNewChat,
  showActivityButton,
  activityCount,
  conversationTitle,
}: ChatTopBarProps) {
  const [clerkLoaded, setClerkLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import Clerk only on client when key is available
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      import("@clerk/clerk-react").then((mod) => {
        ClerkComponents = {
          SignInButton: mod.SignInButton as typeof ClerkComponents extends null ? never : NonNullable<typeof ClerkComponents>["SignInButton"],
          SignedIn: mod.SignedIn as typeof ClerkComponents extends null ? never : NonNullable<typeof ClerkComponents>["SignedIn"],
          SignedOut: mod.SignedOut as typeof ClerkComponents extends null ? never : NonNullable<typeof ClerkComponents>["SignedOut"],
          UserButton: mod.UserButton as typeof ClerkComponents extends null ? never : NonNullable<typeof ClerkComponents>["UserButton"],
        };
        setClerkLoaded(true);
      });
    }
  }, []);

  return (
    <div className="flex h-11 items-center justify-between border-b border-border bg-background px-2">
      {/* Left: sidebar toggle + new chat */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNewChat}
        >
          <PenSquare className="h-4 w-4" />
          <span className="sr-only">New chat</span>
        </Button>
      </div>

      {/* Center: conversation title */}
      <div className="flex-1 min-w-0 px-4 text-center">
        <span className="text-sm font-medium text-foreground truncate block">
          {conversationTitle || "New chat"}
        </span>
      </div>

      {/* Right: activity toggle + auth */}
      <div className="flex items-center gap-1">
        {showActivityButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            onClick={onToggleActivity}
          >
            <Activity className="h-4 w-4" />
            {activityCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activityCount > 9 ? "9+" : activityCount}
              </span>
            )}
            <span className="sr-only">Toggle activity</span>
          </Button>
        )}

        {clerkLoaded && ClerkComponents ? (
          <>
            <ClerkComponents.SignedOut>
              <ClerkComponents.SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Sign in
                </Button>
              </ClerkComponents.SignInButton>
            </ClerkComponents.SignedOut>
            <ClerkComponents.SignedIn>
              <ClerkComponents.UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7",
                  },
                }}
              />
            </ClerkComponents.SignedIn>
          </>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <User className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
