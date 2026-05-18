import { ClerkProvider } from "@clerk/clerk-react";
import ThemeProvider from "@duyet/components/ThemeProvider";
import ThemeToggle from "@duyet/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@duyet/components/ui/card";
import { Button } from "@duyet/components/ui/button";
import { ScrollArea } from "@duyet/components/ui/scroll-area";
import { Separator } from "@duyet/components/ui/separator";
import { Textarea } from "@duyet/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
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

if (!rootElement) {
  throw new Error("Root element is missing.");
}

function AuthUnavailable() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <header className="flex min-h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Sparkles aria-hidden="true" className="size-5 shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">Duyet Agents</h1>
              <p className="truncate text-xs text-muted-foreground">
                Simple chat over duyet.net context
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button disabled type="button" variant="outline">
              Sign in
            </Button>
          </div>
        </header>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-none">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Chat</CardTitle>
            <CardDescription>
              Authentication is not configured for this environment.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="min-h-0 flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="flex min-h-[calc(100dvh-17rem)] flex-col items-center justify-center gap-3 p-4 text-center">
                <Sparkles aria-hidden="true" className="size-5" />
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">Duyet Agents</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Ask about Duyet Le, duyet.net, projects, posts, and data work.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            <form className="flex w-full items-end gap-2">
              <Textarea
                aria-label="Message"
                className="min-h-11 resize-none"
                disabled
                placeholder="Authentication is not configured"
                rows={1}
              />
              <Button aria-label="Send message" disabled size="icon" type="button">
                <Send aria-hidden="true" data-icon="inline-start" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

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
  </StrictMode>
);
