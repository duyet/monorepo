"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  sidebar: React.ReactNode;
  panel?: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  panelOpen: boolean;
  onPanelOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AppLayout({
  sidebar,
  panel,
  sidebarOpen,
  onSidebarOpenChange,
  panelOpen,
  onPanelOpenChange,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar — persistent on lg+, Sheet on mobile */}
      <div
        className={cn(
          "hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
          sidebarOpen ? "w-[260px]" : "w-12"
        )}
      >
        <div className={cn("h-full", sidebarOpen ? "w-[260px]" : "w-12")}>
          {sidebar}
        </div>
      </div>
      <div className="lg:hidden block">
        <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
          <SheetContent side="left" className="w-[280px] p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: chat area */}
      <div className="flex flex-1 flex-col min-w-0">{children}</div>

      {/* Right panel — persistent on lg+, Sheet on mobile */}
      {panel && (
        <>
          <div
            className={cn(
              "hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
              panelOpen ? "w-[300px]" : "w-0"
            )}
          >
            <div className="h-full w-[300px]">{panel}</div>
          </div>
          <div className="lg:hidden block">
            <Sheet open={panelOpen} onOpenChange={onPanelOpenChange}>
              <SheetContent side="right" className="w-[320px] p-0">
                {panel}
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}
    </div>
  );
}
