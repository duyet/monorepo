/**
 * Tests for date helper functions
 */

import { getWeekStart } from "../date-helpers";

describe("date-helpers", () => {
  describe("getWeekStart", () => {
    it("should return Sunday for a date in the middle of the week", () => {
      // Wednesday, January 10, 2024
      const date = new Date("2024-01-10");
      const weekStart = getWeekStart(date);

      // Should return Sunday, January 7, 2024
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(7);
    });

    it("should return the same date if already Sunday", () => {
      // Sunday, January 7, 2024
      const date = new Date("2024-01-07");
      const weekStart = getWeekStart(date);

      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(7);
    });

    it("should return previous Sunday for Saturday", () => {
      // Saturday, January 13, 2024
      const date = new Date("2024-01-13");
      const weekStart = getWeekStart(date);

      // Should return Sunday, January 7, 2024
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(7);
    });

    it("should handle month boundaries correctly", () => {
      // Monday, February 5, 2024
      const date = new Date("2024-02-05");
      const weekStart = getWeekStart(date);

      // Should return Sunday, February 4, 2024
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getMonth()).toBe(1); // February (0-indexed)
      expect(weekStart.getDate()).toBe(4);
    });

    it("should handle year boundaries correctly", () => {
      // Wednesday, January 3, 2024
      const date = new Date("2024-01-03");
      const weekStart = getWeekStart(date);

      // Should return Sunday, December 31, 2023
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getFullYear()).toBe(2023);
      expect(weekStart.getMonth()).toBe(11); // December
      expect(weekStart.getDate()).toBe(31);
    });

    it("should not mutate the original date", () => {
      const date = new Date("2024-01-10");
      const originalTime = date.getTime();

      getWeekStart(date);

      expect(date.getTime()).toBe(originalTime);
    });

    it("should handle different times of day consistently", () => {
      const morning = new Date("2024-01-10T08:00:00");
      const evening = new Date("2024-01-10T20:00:00");

      const morningWeekStart = getWeekStart(morning);
      const eveningWeekStart = getWeekStart(evening);

      expect(morningWeekStart.getDate()).toBe(eveningWeekStart.getDate());
      expect(morningWeekStart.getDay()).toBe(0);
      expect(eveningWeekStart.getDay()).toBe(0);
    });
  });
});
