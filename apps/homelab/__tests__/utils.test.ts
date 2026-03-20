import { describe, expect, it } from "bun:test";
import { UPTIME_RANGES } from "../lib/constants";
import { generateUptime, getHistoricalTime, random } from "../lib/data/utils";

describe("utils", () => {
  describe("random()", () => {
    it("returns a number between min and max", () => {
      const result = random(0, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    });

    it("returns exact value when min equals max", () => {
      const result = random(5, 5);
      expect(result).toBe(5);
    });

    it("returns different values on consecutive calls (statistical test)", () => {
      const results = Array.from({ length: 10 }, () => random(0, 100));
      const uniqueValues = new Set(results);
      // With high probability, not all values should be identical
      // (chance of all being the same is essentially 0 with random distribution)
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe("generateUptime()", () => {
    it("returns string matching pattern 'Xd Xh Xm'", () => {
      const result = generateUptime();
      const pattern = /^\d+d \d+h \d+m$/;
      expect(result).toMatch(pattern);
    });

    it("generates days within valid range from UPTIME_RANGES", () => {
      for (let i = 0; i < 10; i++) {
        const result = generateUptime();
        const days = parseInt(result.split("d")[0], 10);
        expect(days).toBeGreaterThanOrEqual(UPTIME_RANGES.DAYS.min);
        expect(days).toBeLessThanOrEqual(UPTIME_RANGES.DAYS.max);
      }
    });

    it("generates hours within valid range from UPTIME_RANGES", () => {
      for (let i = 0; i < 10; i++) {
        const result = generateUptime();
        const hours = parseInt(result.split("d ")[1].split("h")[0], 10);
        expect(hours).toBeGreaterThanOrEqual(UPTIME_RANGES.HOURS.min);
        expect(hours).toBeLessThanOrEqual(UPTIME_RANGES.HOURS.max);
      }
    });

    it("generates minutes within valid range from UPTIME_RANGES", () => {
      for (let i = 0; i < 10; i++) {
        const result = generateUptime();
        const minutes = parseInt(result.split("h ")[1].split("m")[0], 10);
        expect(minutes).toBeGreaterThanOrEqual(UPTIME_RANGES.MINUTES.min);
        expect(minutes).toBeLessThanOrEqual(UPTIME_RANGES.MINUTES.max);
      }
    });
  });

  describe("getHistoricalTime()", () => {
    it("returns a time string for 0 hours ago", () => {
      const result = getHistoricalTime(0);
      const pattern = /^\d{2}:\d{2}$/;
      expect(result).toMatch(pattern);
    });

    it("returns a valid time string for 24 hours ago", () => {
      const result = getHistoricalTime(24);
      const pattern = /^\d{2}:\d{2}$/;
      expect(result).toMatch(pattern);
    });

    it("returns a valid time string in HH:MM format", () => {
      for (let i = 0; i < 5; i++) {
        const result = getHistoricalTime(i);
        const pattern = /^\d{2}:\d{2}$/;
        expect(result).toMatch(pattern);
        const [hours, minutes] = result.split(":").map(Number);
        expect(hours).toBeGreaterThanOrEqual(0);
        expect(hours).toBeLessThan(24);
        expect(minutes).toBeGreaterThanOrEqual(0);
        expect(minutes).toBeLessThan(60);
      }
    });
  });
});
