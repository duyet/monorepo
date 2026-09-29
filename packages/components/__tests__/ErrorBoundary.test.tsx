import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../ErrorBoundary";

/**
 * Thrown during render, so React routes it to the nearest boundary. The same
 * instance is handed to `onError`, which is what reporting hooks depend on.
 */
const BOOM = new Error("kaboom");

function Boom({ error = BOOM }: { error?: Error }): React.ReactNode {
  throw error;
}

/** `console.error` is React's own report for an uncaught render error. */
const silenceReactErrorLog = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children while nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("all good")).toBeDefined();
  });

  it("replaces the subtree with the fallback once a child throws", () => {
    silenceReactErrorLog();
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("kaboom")).toBeDefined();
    expect(document.body.textContent).not.toContain("all good");
  });

  describe("onError", () => {
    it("fires with the error and React's error info", () => {
      silenceReactErrorLog();
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <Boom />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      const [error, errorInfo] = onError.mock.calls[0];
      expect(error).toBe(BOOM);
      expect(errorInfo).toBeTypeOf("object");
      expect((errorInfo as { componentStack?: string }).componentStack)
        .toBeTypeOf("string");
    });

    it("fires even when the caller supplies no onError, i.e. it is optional", () => {
      silenceReactErrorLog();
      expect(() =>
        render(
          <ErrorBoundary>
            <Boom />
          </ErrorBoundary>
        )
      ).not.toThrow();
      expect(screen.getByText("kaboom")).toBeDefined();
    });
  });

  describe("retry", () => {
    // React re-renders an errored boundary more than once (the
    // getDerivedStateFromError pass, then the componentDidCatch setState) and
    // may synchronously retry the failed subtree. So the assertions below
    // look at the props each render received, never at how many there were.
    it("hands the error and a reset callback to a custom fallback", () => {
      silenceReactErrorLog();
      const seen: { error?: Error; retry: () => void }[] = [];
      const Fallback = (props: { error?: Error; retry: () => void }) => {
        seen.push(props);
        return <p>fallback</p>;
      };

      render(
        <ErrorBoundary fallback={Fallback}>
          <Boom />
        </ErrorBoundary>
      );

      expect(seen.length).toBeGreaterThan(0);
      for (const props of seen) {
        expect(props.error).toBe(BOOM);
        expect(props.retry).toBeTypeOf("function");
      }
    });

    it("re-renders the children when the fallback's retry is invoked", () => {
      silenceReactErrorLog();
      // Flipped by the test, not by a render counter: React is free to retry
      // the failed subtree, which would otherwise paper over a broken reset.
      let broken = true;
      const Flaky = () => {
        if (broken) throw BOOM;
        return <p>recovered</p>;
      };

      render(
        <ErrorBoundary>
          <Flaky />
        </ErrorBoundary>
      );
      expect(screen.getByText("Something went wrong")).toBeDefined();
      expect(screen.queryByText("recovered")).toBeNull();

      broken = false;
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      expect(screen.getByText("recovered")).toBeDefined();
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("clears the remembered error, so a later failure can fall back again", () => {
      silenceReactErrorLog();
      let setBroken: (broken: boolean) => void = () => {};
      const Harness = () => {
        const [broken, set] = useState(true);
        setBroken = set;
        return (
          <ErrorBoundary>{broken ? <Boom /> : <p>recovered</p>}</ErrorBoundary>
        );
      };

      render(<Harness />);
      expect(screen.getByText("Something went wrong")).toBeDefined();

      // Re-break before resetting, so the reset re-runs a subtree that still
      // throws. If the boundary had kept its error state, the fallback would
      // stay on screen and the children would never be attempted again.
      act(() => setBroken(true));
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      expect(screen.getByText("Something went wrong")).toBeDefined();
    });

    it("routes the fallback's own retry callback back into a reset", () => {
      silenceReactErrorLog();
      let broken = true;
      const Flaky = () => {
        if (broken) throw BOOM;
        return <p>recovered</p>;
      };
      let capturedRetry: (() => void) | undefined;

      render(
        <ErrorBoundary
          fallback={(props: { retry: () => void }) => {
            capturedRetry = props.retry;
            return <p>fallback</p>;
          }}
        >
          <Flaky />
        </ErrorBoundary>
      );
      expect(screen.getByText("fallback")).toBeDefined();

      broken = false;
      act(() => capturedRetry?.());

      expect(screen.getByText("recovered")).toBeDefined();
      expect(screen.queryByText("fallback")).toBeNull();
    });
  });

  describe("fallback", () => {
    it("renders a supplied component instead of the default", () => {
      silenceReactErrorLog();
      render(
        <ErrorBoundary fallback={() => <p>only this</p>}>
          <Boom />
        </ErrorBoundary>
      );
      expect(screen.getByText("only this")).toBeDefined();
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("renders a supplied element as-is", () => {
      silenceReactErrorLog();
      render(
        <ErrorBoundary fallback={<p>plain node</p>}>
          <Boom />
        </ErrorBoundary>
      );
      expect(screen.getByText("plain node")).toBeDefined();
    });
  });

  describe("fallbackMessage", () => {
    it("stands in for the generic copy when the error has no message", () => {
      silenceReactErrorLog();
      render(
        <ErrorBoundary fallbackMessage="An error occurred while loading photos.">
          <Boom error={new Error("")} />
        </ErrorBoundary>
      );
      expect(
        screen.getByText("An error occurred while loading photos.")
      ).toBeDefined();
      expect(screen.queryByText("An unexpected error occurred.")).toBeNull();
    });

    it("never shadows a real error message", () => {
      silenceReactErrorLog();
      render(
        <ErrorBoundary fallbackMessage="An error occurred while loading photos.">
          <Boom />
        </ErrorBoundary>
      );
      expect(screen.getByText("kaboom")).toBeDefined();
      expect(
        screen.queryByText("An error occurred while loading photos.")
      ).toBeNull();
    });

    it("defaults to generic copy when no override is given", () => {
      silenceReactErrorLog();
      render(
        <ErrorBoundary>
          <Boom error={new Error("")} />
        </ErrorBoundary>
      );
      expect(screen.getByText("An unexpected error occurred.")).toBeDefined();
    });
  });

  describe("development error details", () => {
    it("hides the detail panel in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      silenceReactErrorLog();

      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeDefined();
      expect(
        screen.queryByText("Show error details (development only)")
      ).toBeNull();
    });

    it("shows the stack in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      silenceReactErrorLog();

      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      );

      expect(
        screen.getByText("Show error details (development only)")
      ).toBeDefined();
    });
  });
});
