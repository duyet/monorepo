import { AuthControl } from "@/components/auth-control";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-start px-2 py-2">
        <AuthControl iconOnly className="h-8 w-8" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
