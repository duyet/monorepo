"use client";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Core layout shell - simplified container without permanent sidebar.
 * Sidebar is now available as a modal/dialog via the Sheet component.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden w-full min-h-screen bg-transparent">
      {children}
    </div>
  );
}
