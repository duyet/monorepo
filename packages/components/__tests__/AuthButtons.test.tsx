import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AuthButtons } from "../header/AuthButtons";

// A stand-in for @clerk/clerk-react. The point of wrapWithProvider={false} is
// that the host has ALREADY mounted the provider from this very module, so
// these primitives are safe to render immediately.
const fakeClerkModule = {
  ClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignedIn: () => null,
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
  UserButton: () => null,
};

// The publishable key AuthButtons reads comes from .env.test — each module
// gets its own import.meta.env object, so it cannot be stubbed from here.
describe("AuthButtons with a host-owned ClerkProvider", () => {
  it("renders on the first render when the module is already available", () => {
    render(
      <AuthButtons wrapWithProvider={false} clerkModule={fakeClerkModule} />
    );

    // Regression: the isOwner ref is set in an effect, so gating on it here
    // left the button blank forever on any mount where the module was
    // already present (e.g. a header remount after Clerk had loaded).
    expect(screen.getByLabelText("Sign in")).toBeTruthy();
  });

  it("renders nothing until the host supplies the module", () => {
    // Never import Clerk ourselves — rendering SignedOut before the host's
    // provider exists is what throws "SignedOut can only be used within
    // the <ClerkProvider /> component".
    const { container } = render(
      <AuthButtons wrapWithProvider={false} clerkModule={null} />
    );
    expect(container.innerHTML).toBe("");
  });
});
