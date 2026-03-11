"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Core layout shell using shadcn Sidebar patterns.
 * Provides responsive sidebar behavior with automatic mobile/desktop handling.
 */
export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-hidden w-full h-full bg-transparent">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
