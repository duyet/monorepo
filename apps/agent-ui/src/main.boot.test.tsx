import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const renderMock = vi.fn();
const createRoot = vi.fn((_element: Element) => ({
  render: renderMock,
  unmount: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: (element: Element) => createRoot(element),
}));
vi.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const dir = dirname(fileURLToPath(import.meta.url));
const BOOT_TIMEOUT = 60_000;

/** Evaluate the real boot module against a fresh module registry. */
async function boot() {
  vi.resetModules();
  await import("./main");
}

function resetRoot() {
  document.body.innerHTML = '<div id="root"></div>';
}

function clearBootFlag() {
  delete (window as Window & { __CF_ENTRY_RAN__?: boolean }).__CF_ENTRY_RAN__;
}

describe("agent-ui boot", () => {
  // The first entry import transforms the whole app module graph (~12k modules),
  // which costs far more than the default per-test budget. Pay it once here.
  beforeAll(async () => {
    resetRoot();
    clearBootFlag();
    await boot();
  }, BOOT_TIMEOUT);

  beforeEach(() => {
    vi.clearAllMocks();
    resetRoot();
    clearBootFlag();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clearBootFlag();
  });

  it("mounts into the #root element in the document", async () => {
    await boot();

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(renderMock).toHaveBeenCalledTimes(1);
  }, BOOT_TIMEOUT);

  it("does not double-mount when the entry is evaluated again", async () => {
    await boot();
    expect(renderMock).toHaveBeenCalledTimes(1);

    // A re-evaluated entry (e.g. a retrying loader) must be a no-op.
    await boot();
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
  }, BOOT_TIMEOUT);

  it("renders a usable chat surface when Clerk is not configured", async () => {
    await boot();

    const tree = renderMock.mock.calls[0]?.[0] as ReactElement;
    const { getByText, getByPlaceholderText } = render(tree);

    // Conversation surface and prompt are present without any auth provider.
    expect(getByText("Ask Duyet anything.")).toBeDefined();
    expect(getByPlaceholderText("Ask Duyet anything…")).toBeDefined();
  }, BOOT_TIMEOUT);

  it("throws a clear error when the #root element is missing", async () => {
    document.body.innerHTML = "";
    await expect(boot()).rejects.toThrow(/root element is missing/i);
  }, BOOT_TIMEOUT);
});

describe("static shell", () => {
  const shell = readFileSync(join(dir, "../index.html"), "utf8");
  const doc = new DOMParser().parseFromString(shell, "text/html");

  it("ships a chat-shaped skeleton inside #root", () => {
    const root = doc.getElementById("root");
    expect(root).not.toBeNull();
    expect(root?.querySelector("header")).not.toBeNull();
    expect(root?.querySelector("main")).not.toBeNull();
    expect(root?.textContent).toContain("Ask Duyet anything.");
  });

  it("loads the app entry module", () => {
    const entry = doc.querySelector('script[type="module"]');
    expect(entry?.getAttribute("src")).toBe("/src/main.tsx");
  });
});
