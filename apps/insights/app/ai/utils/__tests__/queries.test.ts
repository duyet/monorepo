/**
 * Tests for query utility functions
 * These tests verify the date filtering logic to prevent off-by-one errors
 */

import {
  getCreatedAtCondition,
  getDateCondition,
  validateDaysParameter,
} from "../queries";

describe("Query Utilities", () => {
  describe("getDateCondition", () => {
    it("should generate correct WHERE clause for 7 days", () => {
      const result = getDateCondition(7);
      expect(result).toBe("WHERE date > today() - INTERVAL 7 DAY");
    });

    it("should generate correct WHERE clause for 30 days", () => {
      const result = getDateCondition(30);
      expect(result).toBe("WHERE date > today() - INTERVAL 30 DAY");
    });

    it("should generate correct WHERE clause for 365 days", () => {
      const result = getDateCondition(365);
      expect(result).toBe("WHERE date > today() - INTERVAL 365 DAY");
    });

    it('should return empty string for "all" time period', () => {
      const result = getDateCondition("all");
      expect(result).toBe("");
    });

    it("should use > operator not >= to prevent off-by-one errors", () => {
      // Critical: Using > instead of >= ensures exactly N days
      // Example: For 7 days on Nov 12
      // - Using >= gives: Nov 5-12 (8 days) ❌
      // - Using > gives: Nov 6-12 (7 days) ✓
      const result = getDateCondition(7);
      expect(result).toContain(">");
      expect(result).not.toContain(">=");
    });

    it("should handle edge case of 1 day", () => {
      const result = getDateCondition(1);
      expect(result).toBe("WHERE date > today() - INTERVAL 1 DAY");
    });

    it("should handle large time periods", () => {
      const result = getDateCondition(3650);
      expect(result).toBe("WHERE date > today() - INTERVAL 3650 DAY");
    });
  });

  describe("getCreatedAtCondition", () => {
    it("should generate correct WHERE clause for created_at field", () => {
      const result = getCreatedAtCondition(7);
      expect(result).toBe("WHERE created_at > today() - INTERVAL 7 DAY");
    });

    it("should generate correct WHERE clause for 30 days", () => {
      const result = getCreatedAtCondition(30);
      expect(result).toBe("WHERE created_at > today() - INTERVAL 30 DAY");
    });

    it('should return empty string for "all" time period', () => {
      const result = getCreatedAtCondition("all");
      expect(result).toBe("");
    });

    it("should use > operator not >= to prevent off-by-one errors", () => {
      const result = getCreatedAtCondition(7);
      expect(result).toContain(">");
      expect(result).not.toContain(">=");
    });
  });

  describe("validateDaysParameter", () => {
    it('should return "all" for "all" input', () => {
      const result = validateDaysParameter("all");
      expect(result).toBe("all");
    });

    it("should return the same number for valid numeric input", () => {
      expect(validateDaysParameter(7)).toBe(7);
      expect(validateDaysParameter(30)).toBe(30);
      expect(validateDaysParameter(365)).toBe(365);
    });

    it("should return 30 for zero or negative numbers", () => {
      expect(validateDaysParameter(0)).toBe(30);
      expect(validateDaysParameter(-5)).toBe(30);
    });

    it("should return 30 for values exceeding max (3650 days)", () => {
      expect(validateDaysParameter(5000)).toBe(30);
      expect(validateDaysParameter(10000)).toBe(30);
    });

    it("should accept values up to 3650 days (10 years)", () => {
      expect(validateDaysParameter(3650)).toBe(3650);
      expect(validateDaysParameter(1000)).toBe(1000);
    });

    it("should handle edge cases", () => {
      expect(validateDaysParameter(1)).toBe(1);
      expect(validateDaysParameter(3651)).toBe(30); // Just over max
    });
  });

  describe("Date filtering consistency", () => {
    it("should use the same operator in both getDateCondition and getCreatedAtCondition", () => {
      const dateCondition = getDateCondition(7);
      const createdAtCondition = getCreatedAtCondition(7);

      // Both should use the same operator (>)
      const dateOperator = dateCondition.match(/>\s*today\(\)/)?.[0];
      const createdAtOperator = createdAtCondition.match(/>\s*today\(\)/)?.[0];

      expect(dateOperator).toBe(createdAtOperator);
    });

    it("should generate consistent INTERVAL syntax", () => {
      const days = 7;
      const dateCondition = getDateCondition(days);
      const createdAtCondition = getCreatedAtCondition(days);

      // Both should use the same interval syntax
      expect(dateCondition).toContain(`INTERVAL ${days} DAY`);
      expect(createdAtCondition).toContain(`INTERVAL ${days} DAY`);
    });
  });
});
