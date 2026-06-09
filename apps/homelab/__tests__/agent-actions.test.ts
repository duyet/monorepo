import { describe, expect, it } from "vitest";
import { agentActions } from "../lib/data/agent-actions";

describe("agentActions", () => {
  it("is an array with 8-12 entries", () => {
    expect(Array.isArray(agentActions)).toBe(true);
    expect(agentActions.length).toBeGreaterThanOrEqual(8);
    expect(agentActions.length).toBeLessThanOrEqual(12);
  });

  it("each action has required fields", () => {
    agentActions.forEach((action) => {
      expect(action).toHaveProperty("id");
      expect(action).toHaveProperty("timestamp");
      expect(action).toHaveProperty("type");
      expect(action).toHaveProperty("description");
      expect(action).toHaveProperty("target");
      expect(action).toHaveProperty("status");
    });
  });

  it("all type values are valid", () => {
    const validTypes = [
      "health-check",
      "auto-restart",
      "log-collection",
      "version-upgrade",
      "security-fix",
      "config-update",
    ];
    agentActions.forEach((action) => {
      expect(validTypes).toContain(action.type);
    });
  });

  it("all status values are valid", () => {
    const validStatuses = ["success", "running", "failed"];
    agentActions.forEach((action) => {
      expect(validStatuses).toContain(action.status);
    });
  });
});
