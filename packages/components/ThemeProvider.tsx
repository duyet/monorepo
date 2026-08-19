"use client";

import { ThemeProvider, type ThemeProviderProps } from "next-themes";

export default function Providers({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <ThemeProvider
      defaultTheme="system"
      attribute="class"
      enableSystem={true}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}
