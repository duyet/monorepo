import { ClerkProvider } from "@clerk/clerk-react";
import { SiteHeader } from "@duyet/components";
import { ThemeProvider } from "~/components/ThemeProvider";
import { ChatConversation } from "~/components/chatbot/chat";
import { PromptForm } from "~/components/chatbot/prompt-form";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const rootElement = document.getElementById("root");
const isLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
const canUseClerk =
  Boolean(publishableKey) && !(isLocalhost && publishableKey.startsWith("pk_live_"));
const bootWindow = window as Window & { __CF_ENTRY_RAN__?: boolean };

if (!rootElement) {
  throw new Error("Root element is missing.");
}

const alreadyBooted = Boolean(bootWindow.__CF_ENTRY_RAN__);
bootWindow.__CF_ENTRY_RAN__ = true;

function AuthUnavailable() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader
        currentApp="agents"
        localNav={[
          { label: "Chat", href: "/" },
          { label: "API", href: "https://api.duyet.net", external: true },
        ]}
        activeHref="/"
      />
      <main className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <ChatConversation
          messages={[]}
          isBusy={false}
          canSubmit={false}
          onSelectSuggestion={() => {}}
        />
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-6 pb-6">
          <div className="flex flex-col items-start gap-3 rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">
              Sign in to send a message. The chat surface above stays visible
              either way.
            </p>
          </div>
          <PromptForm
            isBusy={false}
            disabled
            placeholder="Ask Duyet anything…"
            onSubmit={() => {}}
          />
        </div>
      </main>
    </div>
  );
}

if (!alreadyBooted) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        {canUseClerk ? (
          <ClerkProvider publishableKey={publishableKey}>
            <App />
          </ClerkProvider>
        ) : (
          <AuthUnavailable />
        )}
      </ThemeProvider>
    </StrictMode>,
  );
}
