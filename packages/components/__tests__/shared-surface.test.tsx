import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Analytics from "../Analytics";
import { ExploreApps } from "../ExploreApps";
import Header from "../header/index";
import { useCardDescription } from "../ai/useCardDescription";

afterEach(() => {
  vi.unstubAllGlobals();
  for (const s of document.querySelectorAll("script")) {
    s.remove();
  }
});

describe("Analytics: the pageview script is requested", () => {
  it("appends a pageview script without waiting for the window load event", () => {
    // Regression: the loader was inlined as `window.onload = function () {…}`.
    // <Analytics /> mounts in a React effect, by which time `load` has usually
    // already fired, so the handler is never invoked and pageview.js is never
    // requested. It also clobbered any onload handler registered before it.
    const { unmount } = render(<Analytics />);

    const pageview = document.querySelector<HTMLScriptElement>(
      'script[src*="pageview.duyet.net"]',
    );
    expect(pageview).not.toBeNull();
    unmount();
  });

});

describe("Header: the closed mobile menu is inert", () => {
  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "https://duyet.net/about" },
  ];

  function panel(container: HTMLElement): HTMLElement {
    const el = container.querySelector<HTMLElement>(
      'div[style*="--mobile-menu-offset"]',
    );
    if (!el) throw new Error("mobile panel not found");
    return el;
  }

  it("marks the panel inert while closed so its links leave the tab order", () => {
    // Regression: the closed panel was only `opacity-0 pointer-events-none`
    // plus aria-hidden. Those hide it visually but leave every link focusable,
    // so keyboard users tabbed into an invisible menu.
    const { container } = render(
      <Header
        navigationItems={navigationItems}
        shortText="CV"
        showAuthButtons={false}
      />,
    );

    const closed = panel(container);
    expect(closed.getAttribute("aria-hidden")).toBe("true");
    expect(closed.getAttribute("inert")).not.toBeNull();
  });

  it("removes inert once the menu is opened", () => {
    const { container } = render(
      <Header
        navigationItems={navigationItems}
        shortText="CV"
        showAuthButtons={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("Open menu"));
    const open = panel(container);
    expect(open.getAttribute("aria-hidden")).toBe("false");
    expect(open.hasAttribute("inert")).toBe(false);
  });

  it("makes a link inside the closed panel unfocusable", () => {
    const { container } = render(
      <Header
        navigationItems={navigationItems}
        shortText="CV"
        showAuthButtons={false}
      />,
    );

    const link = panel(container).querySelector<HTMLAnchorElement>("a");
    if (!link) throw new Error("expected a link in the mobile panel");
    link.focus();
    expect(document.activeElement).not.toBe(link);
  });
});

describe("useCardDescription: changing cardType refetches", () => {
  function Card({ cardType }: { cardType: "blog" | "featured" }) {
    const { description, isLoading } = useCardDescription({ cardType });
    return <p>{description ?? (isLoading ? "loading" : "none")}</p>;
  }

  it("re-runs the request when cardType changes", async () => {
    // Regression: the effect body bailed out with
    // `if (description && !error) return`, so once any description had been
    // stored the effect was a no-op on every later run — including runs
    // triggered by a new cardType. The card kept the previous card type's
    // copy forever.
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { prompt: string };
      return new Response(
        JSON.stringify({
          description: body.prompt.includes("featured")
            ? "featured copy"
            : "blog copy",
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    function Host() {
      const [cardType, setCardType] = useState<"blog" | "featured">("blog");
      return (
        <>
          <button type="button" onClick={() => setCardType("featured")}>
            promote
          </button>
          <Card cardType={cardType} />
        </>
      );
    }

    render(<Host />);
    await waitFor(() => expect(screen.getByText("blog copy")).toBeTruthy());

    screen.getByRole("button", { name: "promote" }).click();

    await waitFor(() => expect(screen.getByText("featured copy")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("ExploreApps: the eyebrow prop is honoured", () => {
  it("renders the eyebrow it is given", () => {
    // Regression: `eyebrow` was declared on the public props interface with a
    // doc comment and silently dropped — the component only ever rendered
    // `title`.
    render(<ExploreApps currentApp="home" eyebrow="Elsewhere" />);
    expect(screen.getByText("Elsewhere")).toBeTruthy();
  });

  it("renders no extra element when no eyebrow is passed", () => {
    const { container } = render(<ExploreApps currentApp="home" />);
    expect(container.querySelectorAll("h2")).toHaveLength(1);
  });
});
