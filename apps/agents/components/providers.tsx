import ThemeProvider from "@duyet/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
