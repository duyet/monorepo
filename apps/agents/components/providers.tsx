import { ClerkProvider } from "@clerk/clerk-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const content = (
    <ThemeProvider>
      <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
      <Toaster
        closeButton
        expand={false}
        position="bottom-right"
        richColors
        theme="system"
      />
    </ThemeProvider>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  );
}
