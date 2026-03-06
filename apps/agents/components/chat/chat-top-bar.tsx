"use client";

import { Button } from "@duyet/components";
import { Activity, MoreHorizontal, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { useClerkComponents } from "@/lib/hooks/use-clerk-components";
import { SettingsDialog } from "../settings/settings-dialog";

interface ChatTopBarProps {
  onToggleActivity: () => void;
  onToggleTools?: () => void;
  onNewChat: () => void;
  showActivityButton: boolean;
  activityCount: number;
  conversationTitle?: string;
}

export function ChatTopBar({
  onToggleActivity,
  onToggleTools,
  onNewChat,
  showActivityButton,
  activityCount,
  conversationTitle,
}: ChatTopBarProps) {
  const clerk = useClerkComponents();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="absolute top-0 w-full z-10 flex h-14 items-center justify-between bg-transparent px-4 py-2">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm font-semibold tracking-tight text-foreground gap-2">
            <span>{conversationTitle || "New Task"}</span>
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

          {onToggleTools && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md shadow-sm bg-background"
              onClick={onToggleTools}
            >
              <Wrench className="h-4 w-4" />
              <span className="sr-only">Tools</span>
            </Button>
          )}

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

          {clerk && (
            <>
              <clerk.SignedOut>
                <clerk.SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium rounded-md shadow-sm bg-background ml-1"
                  >
                    Sign in
                  </Button>
                </clerk.SignInButton>
              </clerk.SignedOut>
              <clerk.SignedIn>
                <div className="ml-1">
                  <clerk.UserButton
                    appearance={{
                      elements: { avatarBox: "h-7 w-7" },
                    }}
                  />
                </div>
              </clerk.SignedIn>
            </>
          )}
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
