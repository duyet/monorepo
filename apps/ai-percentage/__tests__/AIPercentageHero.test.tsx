// @vitest-environment happy-dom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TARGET = 42.5;

vi.mock("../lib/queries", () => ({
  getCurrentAICodePercentage: () =>
    Promise.resolve({
      ai_percentage: TARGET,
      total_lines_added: 10_000,
      human_lines_added: 5000,
      ai_lines_added: 5000,
    }),
}));

import { AIPercentageHero } from "../components/AIPercentageHero";

/** Drive requestAnimationFrame by hand so frame counts and the clock are exact. */
function installRaf() {
  let nextId = 0;
  let clock = 0;
  const queue: Array<{ id: number; at: number; cb: FrameRequestCallback }> = [];

  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    nextId += 1;
    queue.push({ id: nextId, at: clock + 16, cb });
    return nextId;
  }) as typeof requestAnimationFrame;

  globalThis.cancelAnimationFrame = ((id: number) => {
    const i = queue.findIndex((f) => f.id === id);
    if (i >= 0) queue.splice(i, 1);
  }) as typeof cancelAnimationFrame;

  globalThis.performance.now = () => clock;

  /** Advance the fake clock, running every frame callback that comes due. */
  const advance = (ms: number) => {
    const end = clock + ms;
    // Bounded so a runaway scheduler fails an assertion instead of hanging.
    for (let guard = 0; guard < 100_000; guard += 1) {
      let next = -1;
      for (let i = 0; i < queue.length; i += 1) {
        if (queue[i].at <= end && (next < 0 || queue[i].at < queue[next].at)) {
          next = i;
        }
      }
      if (next < 0) break;
      const frame = queue.splice(next, 1)[0];
      clock = frame.at;
      frame.cb(clock);
    }
    clock = end;
  };

  const rendered = (el: HTMLElement) =>
    Number(/^([\d.]+)%/.exec(el.textContent ?? "")?.[1]);

  return {
    advance,
    rendered,
    get scheduledFrames() {
      return nextId;
    },
    get pendingFrames() {
      return queue.length;
    },
  };
}

const mount = async () => {
  const raf = installRaf();
  const view = render(<AIPercentageHero />);
  // Let the SWR promise settle so the hero leaves its loading branch.
  await act(async () => {
    await Promise.resolve();
  });
  return { raf, view };
};

describe("AIPercentageHero count-up", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("ramps linearly and reaches the reported percentage inside its own duration", async () => {
    const { raf, view } = await mount();

    act(() => raf.advance(500));
    // Halfway through a 1000ms ramp must be about halfway to the target.
    expect(raf.rendered(view.container)).toBeGreaterThan(TARGET * 0.4);
    expect(raf.rendered(view.container)).toBeLessThan(TARGET * 0.6);

    act(() => raf.advance(600));
    expect(raf.rendered(view.container)).toBe(TARGET);
  });

  it("stops scheduling frames once the count-up finishes", async () => {
    const { raf, view } = await mount();

    // One frame of slack: the frame that lands on progress === 1 fires just
    // after the nominal duration.
    act(() => raf.advance(1100));
    expect(raf.rendered(view.container)).toBe(TARGET);
    expect(raf.pendingFrames).toBe(0);

    const whenDone = raf.scheduledFrames;

    // Nothing should still be animating. An effect that lists the value it
    // writes in its own deps re-runs every frame and re-arms itself here.
    act(() => raf.advance(10_000));
    expect(raf.scheduledFrames).toBe(whenDone);
  });

  it("schedules roughly one frame per tick, not one chain per state write", async () => {
    const { raf } = await mount();

    act(() => raf.advance(5000));
    // A 1000ms ramp at 16ms per frame is ~63 frames, once. The broken version
    // re-arms on every frame and sustains that rate indefinitely: 63 more per
    // second forever (316 over five seconds in this harness).
    expect(raf.scheduledFrames).toBeLessThan(100);
  });

  it("stops scheduling frames after unmount", async () => {
    const { raf, view } = await mount();

    act(() => raf.advance(1100));
    const whenUnmounted = raf.scheduledFrames;
    expect(whenUnmounted).toBeGreaterThan(0);

    act(() => view.unmount());
    act(() => raf.advance(10_000));

    expect(raf.scheduledFrames).toBe(whenUnmounted);
  });
});
