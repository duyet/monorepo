import type { ComponentProps } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={className}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          size="icon"
          variant="outline"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
