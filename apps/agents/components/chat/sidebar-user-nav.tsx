import { LogIn, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useClerkComponents } from "@/lib/hooks/use-clerk-components";

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function SidebarUserNav() {
  const clerk = useClerkComponents();

  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || !clerk) {
    return null;
  }

  const { SignedIn, SignedOut, SignInButton, useUser } = clerk;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SignedOut>
          <SignInButton mode="modal">
            <SidebarMenuButton
              className="h-10 rounded-2xl border border-sidebar-border/60 bg-background px-3 text-sidebar-foreground/80 shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              data-testid="user-nav-sign-in"
            >
              <LogIn />
              <span className="text-sm font-medium">Sign in</span>
            </SidebarMenuButton>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SignedInUserMenu useUser={useUser} />
        </SignedIn>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SignedInUserMenu({
  useUser,
}: {
  useUser: NonNullable<ReturnType<typeof useClerkComponents>>["useUser"];
}) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = user?.fullName ?? user?.firstName ?? email;

  const handleSignOut = async () => {
    try {
      const clerkInstance = (window as any).Clerk;
      if (clerkInstance) {
        await clerkInstance.signOut();
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="h-10 rounded-2xl border border-sidebar-border/60 bg-background px-3 text-sidebar-foreground/80 shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          data-testid="user-nav-button"
        >
          <div
            className="size-7 shrink-0 rounded-full ring-1 ring-sidebar-border/60"
            style={{
              background: `linear-gradient(135deg, oklch(0.35 0.08 ${emailToHue(email)}), oklch(0.25 0.05 ${emailToHue(email) + 40}))`,
            }}
          />
          <div className="min-w-0 flex-1 text-left">
            <div
              className="truncate text-sm font-medium"
              data-testid="user-email"
            >
              {displayName}
            </div>
            <div className="truncate text-xs text-sidebar-foreground/50">
              Account
            </div>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-popper-anchor-width]"
        data-testid="user-nav-menu"
        side="top"
      >
        <DropdownMenuItem className="cursor-pointer text-sm">
          <span className="truncate">{email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          data-testid="user-nav-item-auth"
          onSelect={handleSignOut}
        >
          <LogOut />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
