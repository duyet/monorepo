import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PREFS, loadPrefs, readerCssVars, savePrefs } from "./prefs";

function createLocalStorageStub() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

// vitest's "node" environment has no window/localStorage — stub the bare
// minimum prefs.ts needs so its SSR guards (`typeof window`) exercise the
// browser branch instead of always short-circuiting to defaults.
beforeEach(() => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", createLocalStorageStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("prefs", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("round-trips saved prefs", () => {
    const prefs = {
      ...DEFAULT_PREFS,
      font: "serif" as const,
      fontSize: 1.15,
      density: "spacious" as const,
      bg: "cream" as const,
      sections: { ...DEFAULT_PREFS.sections, trending: false },
    };
    savePrefs(prefs);
    expect(loadPrefs()).toEqual(prefs);
  });

  it("clamps out-of-range font sizes", () => {
    localStorage.setItem("news_prefs", JSON.stringify({ fontSize: 9 }));
    expect(loadPrefs().fontSize).toBe(1.25);
    localStorage.setItem("news_prefs", JSON.stringify({ fontSize: -3 }));
    expect(loadPrefs().fontSize).toBe(0.85);
  });

  it("defaults tldrCount to 8 and clamps invalid values", () => {
    expect(DEFAULT_PREFS.tldrCount).toBe(8);
    localStorage.setItem("news_prefs", JSON.stringify({ tldrCount: 12 }));
    expect(loadPrefs().tldrCount).toBe(12);
    localStorage.setItem("news_prefs", JSON.stringify({ tldrCount: 99 }));
    expect(loadPrefs().tldrCount).toBe(8);
    localStorage.setItem("news_prefs", JSON.stringify({ tldrCount: "16" }));
    expect(loadPrefs().tldrCount).toBe(8);
  });

  it("falls back to defaults on malformed JSON", () => {
    localStorage.setItem("news_prefs", "not json");
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("maps density to a css padding var", () => {
    expect(
      readerCssVars({ ...DEFAULT_PREFS, density: "compact" })["--reader-pad"]
    ).toBe("0.5rem");
    expect(
      readerCssVars({ ...DEFAULT_PREFS, density: "spacious" })["--reader-pad"]
    ).toBe("1.125rem");
  });

  it("returns defaults when window is unavailable (SSR)", () => {
    vi.unstubAllGlobals();
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
    expect(() => savePrefs(DEFAULT_PREFS)).not.toThrow();
  });
});
