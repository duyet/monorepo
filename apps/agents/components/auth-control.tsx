import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerkComponents } from "@/lib/hooks/use-clerk-components";

interface AuthControlProps {
  iconOnly?: boolean;
  className?: string;
}

export function AuthControl({ iconOnly = false, className }: AuthControlProps) {
  const clerk = useClerkComponents();

  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || !clerk) {
    return null;
  }

  const { SignedIn, SignedOut, SignInButton, UserButton } = clerk;

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant={iconOnly ? "ghost" : "outline"}
            size={iconOnly ? "icon" : "sm"}
            className={className}
          >
            <LogIn className="h-4 w-4" />
            {!iconOnly && "Sign in"}
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className={className}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: iconOnly ? "h-8 w-8" : "h-9 w-9",
                userButtonTrigger:
                  "rounded-full border border-border bg-background shadow-sm",
              },
            }}
          />
        </div>
      </SignedIn>
    </>
  );
}
