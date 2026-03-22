import { ClerkProvider } from "@clerk/clerk-react";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const content = (
    <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  );
}
