import { AuthButtons } from "@duyet/components/header/AuthButtons";
import ThemeToggle from "@duyet/components/ThemeToggle";

export function FooterInteractive() {
  return (
    <>
      <ThemeToggle />
      <AuthButtons
        signInClassName="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        avatarSize="h-5 w-5"
      />
    </>
  );
}
