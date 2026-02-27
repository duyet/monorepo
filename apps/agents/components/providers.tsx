"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { useState, useEffect } from "react";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // During SSR/prerender, render without Clerk
  if (!mounted || !CLERK_KEY) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <ThemeProvider>{children}</ThemeProvider>
    </ClerkProvider>
  );
}
