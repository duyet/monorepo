import { AuthButtons } from "@duyet/components/header/AuthButtons";
import ThemeToggle from "@duyet/components/ThemeToggle";

export function FooterInteractive() {
  return (
    <>
      <ThemeToggle />
      <AuthButtons
        signInClassName="text-[var(--muted-foreground)]/70 hover:text-[var(--foreground)] transition-colors"
        avatarSize="h-5 w-5"
      />
    </>
  );
}
