import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Lightbox from "@/components/Lightbox";
import type { Photo } from "@/lib/types";
import { PHOTO_URLS } from "../test-fixtures";

const photo: Photo = {
  id: "p1",
  provider: "unsplash",
  created_at: "2024-01-01 00:00:00",
  width: 100,
  height: 100,
  urls: PHOTO_URLS,
  user: { id: "u1", username: "u1", name: "U One" },
};

const clickSpeed = (seconds: number) =>
  fireEvent.click(
    screen.getByLabelText(`Set slideshow speed to ${seconds} seconds`)
  );

const startSlideshow = () =>
  fireEvent.click(screen.getByLabelText("Start slideshow"));

describe("Lightbox slideshow playback speed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("advances on the initial 3s default", () => {
    const onNext = vi.fn();
    render(
      <Lightbox
        photo={photo}
        isOpen
        onClose={() => {}}
        onNext={onNext}
        currentIndex={0}
        totalCount={5}
      />
    );

    startSlideshow();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onNext).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  test("changing speed while playing applies the NEW speed, not the previous one", () => {
    const onNext = vi.fn();
    render(
      <Lightbox
        photo={photo}
        isOpen
        onClose={() => {}}
        onNext={onNext}
        currentIndex={0}
        totalCount={5}
      />
    );

    startSlideshow();
    // Default is 3s. Ask for 10s.
    clickSpeed(10);

    // Must NOT advance at the old 3s cadence.
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onNext).not.toHaveBeenCalled();

    // Must advance at the new 10s cadence.
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  test("a second speed change applies its own new speed, not the first", () => {
    const onNext = vi.fn();
    render(
      <Lightbox
        photo={photo}
        isOpen
        onClose={() => {}}
        onNext={onNext}
        currentIndex={0}
        totalCount={5}
      />
    );

    startSlideshow();
    clickSpeed(1);

    // The 1s cadence must be live immediately, not the 3s default.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    // Now ask for 5s: the 1s cadence must stop and the 5s one take over.
    clickSpeed(5);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onNext).toHaveBeenCalledTimes(2);
  });
});
