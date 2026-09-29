import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import PhotoGrid from "@/components/PhotoGrid";
import type { Photo } from "@/lib/photo-provider";

/**
 * The grid's children are stubbed so a failure lands inside the boundary that
 * `PhotoGrid` actually renders. That keeps this test about the call site's
 * wiring — which boundary, which copy, which recovery affordance — instead of
 * about `PhotoCard`'s internals.
 */
const CARD_ERROR = new Error("card exploded");

/** Swapped by each test; `vi.mock` is hoisted, so the stub reads it lazily. */
let cardError: Error | null = null;

vi.mock("@/components/PhotoCard", () => ({
  default: ({ photo }: { photo: Photo }) => {
    if (cardError) {
      throw cardError;
    }
    return <p>card {photo.id}</p>;
  },
}));

const photos = [
  { id: "a", provider: "unsplash" },
  { id: "b", provider: "unsplash" },
] as unknown as Photo[];

beforeAll(() => {
  // React logs every error a boundary catches; that noise is the component
  // working, not a test failure.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  cardError = null;
});

describe("PhotoGrid error boundary", () => {
  it("renders the grid when nothing throws", () => {
    render(<PhotoGrid photos={photos} />);
    expect(screen.getByText("card a")).toBeDefined();
    expect(screen.getByText("card b")).toBeDefined();
  });

  it("catches a failing card and shows the shared fallback", () => {
    cardError = CARD_ERROR;
    render(<PhotoGrid photos={photos} />);

    expect(screen.queryByText("card a")).toBeNull();
    expect(screen.getByText(CARD_ERROR.message)).toBeDefined();
  });

  it("keeps the photos-specific copy for an error with no message", () => {
    // The fork hard-coded "while loading the photos" in a file that looked
    // shared. That wording now travels as a prop, so it must still reach the
    // fallback — and must stay out of the generic message.
    cardError = new Error("");
    render(<PhotoGrid photos={photos} />);

    expect(
      screen.getByText("An unexpected error occurred while loading the photos.")
    ).toBeDefined();
    expect(screen.queryByText("An unexpected error occurred.")).toBeNull();
  });

  it("offers a retry that re-renders the grid", () => {
    cardError = CARD_ERROR;
    render(<PhotoGrid photos={photos} />);
    expect(screen.queryByText("card a")).toBeNull();

    cardError = null;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("card a")).toBeDefined();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });
});
