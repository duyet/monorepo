import { ChevronUp, LogIn, LogOut, Moon, Sun } from "lucide-react";
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

  // If Clerk is not configured, show nothing
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
              className="h-8 px-2 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground"
              data-testid="user-nav-sign-in"
            >
              <LogIn className="h-4 w-4" />
              <span className="text-[13px]">Sign in</span>
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

/** Inner component that can call useUser() because it renders inside SignedIn */
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
          className="h-8 px-2 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          data-testid="user-nav-button"
        >
          <div
            className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
            style={{
              background: `linear-gradient(135deg, oklch(0.35 0.08 ${emailToHue(email)}), oklch(0.25 0.05 ${emailToHue(email) + 40}))`,
            }}
          />
          <span className="truncate text-[13px]" data-testid="user-email">
            {displayName}
          </span>
          <ChevronUp className="ml-auto size-3.5 text-sidebar-foreground/50" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-popper-anchor-width] rounded-lg"
        data-testid="user-nav-menu"
        side="top"
      >
        <DropdownMenuItem className="cursor-pointer text-[13px]">
          <span className="truncate">{email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-[13px]"
          data-testid="user-nav-item-auth"
          onSelect={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
