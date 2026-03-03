"use client";

import { Button } from "@duyet/components";
import { Activity, Menu, PenSquare, Settings, User } from "lucide-react";
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
      <div className="absolute top-0 w-full z-10 flex h-14 items-center justify-between bg-transparent px-4">
        {/* Left: empty placeholder to balance flex-between if needed */}
        <div className="flex items-center gap-2 w-9"></div>

        {/* Center: conversation title */}
        <div className="flex-1 min-w-0 px-4 flex justify-center">
          <div className="flex items-center h-8 px-4 text-sm font-medium text-muted-foreground">
            {conversationTitle}
          </div>
        </div>

        {/* Right: tools toggle + activity toggle + auth */}
        <div className="flex items-center gap-2">
          {onToggleTools && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onToggleTools}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Toggle agent tools</span>
            </Button>
          )}

          {/* User Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <User className="h-4 w-4" />
            <span className="sr-only">User Settings</span>
          </Button>

          {showActivityButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
              onClick={onToggleActivity}
            >
              <Activity className="h-4 w-4" />
              {activityCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold px-4 hidden sm:flex"
                  >
                    Sign in
                  </Button>
                </ClerkComponents.SignInButton>
              </ClerkComponents.SignedOut>
              <ClerkComponents.SignedIn>
                <div className="ml-1 pl-1">
                  <ClerkComponents.UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                </div>
              </ClerkComponents.SignedIn>
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
