"use client";

import { AuthButtons } from "@duyet/components/header/AuthButtons";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-start px-2 py-2">
        <AuthButtons
          signInClassName="h-8 w-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          avatarSize="h-8 w-8"
          wrapWithProvider={false}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
