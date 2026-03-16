import { describe, expect, it } from "bun:test";
import { services } from "../lib/data/services";

describe("services", () => {
  describe("services array", () => {
    it("exists and has items", () => {
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it("each service has required fields", () => {
      services.forEach((service) => {
        expect(service).toHaveProperty("name");
        expect(service).toHaveProperty("namespace");
        expect(service).toHaveProperty("status");
        expect(service).toHaveProperty("node");
        expect(service).toHaveProperty("port");
        expect(service).toHaveProperty("cpu");
        expect(service).toHaveProperty("memory");
      });
    });

    it("all service statuses are valid values", () => {
      const validStatuses = ["running", "stopped", "error"];
      services.forEach((service) => {
        expect(validStatuses).toContain(service.status);
      });
    });

    it("all services have numeric port values", () => {
      services.forEach((service) => {
        expect(typeof service.port).toBe("number");
        expect(service.port).toBeGreaterThan(0);
        expect(service.port).toBeLessThanOrEqual(65535);
      });
    });

    it("all services have non-negative cpu and memory values", () => {
      services.forEach((service) => {
        expect(typeof service.cpu).toBe("number");
        expect(service.cpu).toBeGreaterThanOrEqual(0);
        expect(typeof service.memory).toBe("number");
        expect(service.memory).toBeGreaterThanOrEqual(0);
      });
    });

    it("all services have valid uptime format", () => {
      const uptimePattern = /^\d+d \d+h \d+m$/;
      services.forEach((service) => {
        expect(service.uptime).toMatch(uptimePattern);
      });
    });

    it("has at least 19 expected services", () => {
      expect(services.length).toBeGreaterThanOrEqual(19);
    });
  });
});
