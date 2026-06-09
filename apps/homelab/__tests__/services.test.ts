import { describe, expect, it } from "vitest";
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

    it("has at least 21 expected services", () => {
      expect(services.length).toBeGreaterThanOrEqual(21);
    });

    it("duyetbot service has stopped status", () => {
      const svc = services.find((s) => s.name === "duyetbot");
      expect(svc).toBeDefined();
      expect(svc!.status).toBe("stopped");
      expect(svc!.cpu).toBe(0);
    });

    it("openclaw service has stopped status", () => {
      const svc = services.find((s) => s.name === "openclaw");
      expect(svc).toBeDefined();
      expect(svc!.status).toBe("stopped");
      expect(svc!.cpu).toBe(0);
    });

    it("hermes-agent service exists and is running", () => {
      const svc = services.find((s) => s.name === "hermes-agent");
      expect(svc).toBeDefined();
      expect(svc!.status).toBe("running");
      expect(svc!.cpu).toBeGreaterThan(0);
    });
  });
});
