import { ClerkProvider } from "@clerk/clerk-react";
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
    <main className="auth-shell">
      <div className="auth-panel">
        <h1>Duyet Agents</h1>
        <p>Authentication is not configured for this environment.</p>
      </div>
    </main>
  );
}

createRoot(rootElement).render(
  <StrictMode>
    {canUseClerk ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <AuthUnavailable />
    )}
  </StrictMode>
);
