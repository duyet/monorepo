import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useColorScheme } from "./useColorScheme";

describe("useColorScheme", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();

    // Reset matchMedia mock
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  describe("initialization", () => {
    it("should initialize with system preference by default", () => {
      const { result } = renderHook(() => useColorScheme());

      expect(result.current.preference).toBe("system");
      expect(result.current.scheme).toBe("light");
    });

    it("should initialize with custom preference", () => {
      const { result } = renderHook(() => useColorScheme("dark"));

      expect(result.current.preference).toBe("dark");
      expect(result.current.scheme).toBe("dark");
    });

    it("should load preference from localStorage", () => {
      window.localStorage.setItem("chatkit-color-scheme", "dark");

      const { result } = renderHook(() => useColorScheme());

      expect(result.current.preference).toBe("dark");
      expect(result.current.scheme).toBe("dark");
    });
  });

  describe("setScheme", () => {
    it("should update scheme to light", () => {
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme("light");
      });

      expect(result.current.scheme).toBe("light");
      expect(result.current.preference).toBe("light");
    });

    it("should update scheme to dark", () => {
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme("dark");
      });

      expect(result.current.scheme).toBe("dark");
      expect(result.current.preference).toBe("dark");
    });

    it("should persist scheme to localStorage", async () => {
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme("dark");
      });

      await waitFor(() => {
        expect(window.localStorage.getItem("chatkit-color-scheme")).toBe(
          "dark",
        );
      });
    });
  });

  describe("setPreference", () => {
    it("should update preference to system", () => {
      const { result } = renderHook(() => useColorScheme("dark"));

      act(() => {
        result.current.setPreference("system");
      });

      expect(result.current.preference).toBe("system");
    });

    it("should update preference to specific scheme", () => {
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setPreference("dark");
      });

      expect(result.current.preference).toBe("dark");
      expect(result.current.scheme).toBe("dark");
    });

    it("should remove localStorage item when set to system", async () => {
      window.localStorage.setItem("chatkit-color-scheme", "dark");
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setPreference("system");
      });

      await waitFor(() => {
        expect(window.localStorage.getItem("chatkit-color-scheme")).toBeNull();
      });
    });
  });

  describe("resetPreference", () => {
    it("should reset preference to system", () => {
      const { result } = renderHook(() => useColorScheme("dark"));

      act(() => {
        result.current.resetPreference();
      });

      expect(result.current.preference).toBe("system");
    });

    it("should remove localStorage item", async () => {
      window.localStorage.setItem("chatkit-color-scheme", "dark");
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.resetPreference();
      });

      await waitFor(() => {
        expect(window.localStorage.getItem("chatkit-color-scheme")).toBeNull();
      });
    });
  });

  describe("system preference detection", () => {
    it("should resolve to dark when system prefers dark", () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMediaMock,
      });

      const { result } = renderHook(() => useColorScheme("system"));

      expect(result.current.scheme).toBe("dark");
    });
  });

  describe("DOM updates", () => {
    it("should apply scheme to document element", () => {
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme("dark");
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.dataset.colorScheme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("should remove dark class when switching to light", () => {
      const { result } = renderHook(() => useColorScheme("dark"));

      act(() => {
        result.current.setScheme("light");
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.dataset.colorScheme).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });
});
