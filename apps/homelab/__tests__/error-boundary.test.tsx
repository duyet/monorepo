// @vitest-environment happy-dom
import { ErrorBoundary } from "@duyet/components";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * The homelab route wraps its dashboard sections in the shared ErrorBoundary.
 * Its fork offered only "Refresh Page"; the shared default fallback adds a
 * "Try Again" reset, so the app's recovery path needs a regression test.
 */
const TILE_ERROR = new Error("tile exploded");

function ExplodingTile(): React.ReactNode {
  throw TILE_ERROR;
}

beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("homelab error boundary", () => {
  it("renders the section when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>cluster overview</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("cluster overview")).toBeDefined();
  });

  it("catches a failing section and shows the shared fallback", () => {
    render(
      <ErrorBoundary>
        <ExplodingTile />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText(TILE_ERROR.message)).toBeDefined();
  });

  it("keeps both the reset and the refresh affordances", () => {
    // The fork's Card fallback had "Refresh Page" only, so a transient tile
    // failure forced a full reload. Both buttons must be present now.
    render(
      <ErrorBoundary>
        <ExplodingTile />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /try again/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /refresh page/i })).toBeDefined();
  });

  it("re-renders the section on retry once the fault clears", () => {
    let broken = true;
    const FlakyTile = () => {
      if (broken) {
        throw TILE_ERROR;
      }
      return <p>recovered tile</p>;
    };

    render(
      <ErrorBoundary>
        <FlakyTile />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();

    broken = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("recovered tile")).toBeDefined();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });

  it("falls back to generic copy when the error carries no message", () => {
    // The old fork's default text promised a refresh; the shared copy is
    // app-agnostic, and homelab passes no override.
    function Nameless(): React.ReactNode {
      throw new Error("");
    }

    render(
      <ErrorBoundary>
        <Nameless />
      </ErrorBoundary>
    );

    expect(screen.getByText("An unexpected error occurred.")).toBeDefined();
  });

  it("hides the error detail panel in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    render(
      <ErrorBoundary>
        <ExplodingTile />
      </ErrorBoundary>
    );

    expect(screen.getByText(TILE_ERROR.message)).toBeDefined();
    expect(
      screen.queryByText("Show error details (development only)")
    ).toBeNull();
  });

  it("shows the error detail panel in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(
      <ErrorBoundary>
        <ExplodingTile />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Show error details (development only)")
    ).toBeDefined();
  });

  it("still accepts a plain node fallback, as the fork's prop type allowed", () => {
    render(
      <ErrorBoundary fallback={<p>section unavailable</p>}>
        <ExplodingTile />
      </ErrorBoundary>
    );

    expect(screen.getByText("section unavailable")).toBeDefined();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });
});
