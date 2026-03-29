import { expect, test, mock } from "bun:test";
import app from "./index";

test("GET / returns API info", async () => {
  const mockRequest = mock(() =>
    Promise.resolve({
      status: 200,
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        name: "duyet.net API",
        version: "1.0.0",
        status: "healthy",
        endpoints: {
          health: "/health",
          cardDescription: "/api/card-description",
        },
      }),
    } as Response)
  );

  global.request = mockRequest;
  const res = await app.request("/");

  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.name).toBe("duyet.net API");
  expect(json.status).toBe("healthy");
});

test("GET /health returns health status", async () => {
  const mockRequest = mock(() =>
    Promise.resolve({
      status: 200,
      headers: { "Content-Type": "application/json" },
      json: async () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
    } as Response)
  );

  global.request = mockRequest;
  const res = await app.request("/health");

  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.status).toBe("ok");
  expect(json.timestamp).toBeDefined();
});

test("POST /api/llm/generate validates prompt", async () => {
  const mockRequest = mock(() =>
    Promise.resolve({
      status: 400,
      headers: { "Content-Type": "application/json" },
      json: async () => ({ error: "prompt is required" }),
    } as Response)
  );

  global.request = mockRequest;
  const res = await app.request("/api/llm/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json.error).toContain("prompt");
});

test("POST /api/llm/generate validates prompt type", async () => {
  const mockRequest = mock(() =>
    Promise.resolve({
      status: 400,
      headers: { "Content-Type": "application/json" },
      json: async () => ({ error: "prompt must be a string" }),
    } as Response)
  );

  global.request = mockRequest;
  const res = await app.request("/api/llm/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: 123 }),
  });

  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json.error).toContain("prompt");
});
test("GET / handles 404", async () => {
  const mockRequest = mock(() =>
    Promise.resolve({
      status: 404,
      headers: { "Content-Type": "application/json" },
      json: async () => ({ error: "Not Found" }),
    } as Response)
  );

  global.request = mockRequest;
  const res = await app.request("/nonexistent");

  expect(res.status).toBe(404);
  const json = await res.json();
  expect(json.error).toBe("Not Found");
});
