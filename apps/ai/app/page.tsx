"use client";

import { useCallback } from "react";

import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function Home() {
  const { scheme, setScheme } = useColorScheme("light");

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <ChatKitPanel
        theme={scheme}
        onWidgetAction={handleWidgetAction}
        onResponseEnd={handleResponseEnd}
        onThemeRequest={setScheme}
      />
    </main>
  );
}
