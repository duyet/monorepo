import type { ComponentProps } from "react";
import { Sidebar as PanelLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarToggle({
  className,
  ...props
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          className={className}
          data-testid="sidebar-toggle-button"
          onClick={(e) => {
            toggleSidebar();
            props.onClick?.(e);
          }}
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
