import { ClerkProvider } from "@clerk/clerk-react";
import ThemeProvider from "@duyet/components/ThemeProvider";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  const isValidClerkKey = CLERK_KEY?.startsWith("pk_");

  if (!isValidClerkKey) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY!}>
      <ThemeProvider>{children}</ThemeProvider>
    </ClerkProvider>
  );
}
