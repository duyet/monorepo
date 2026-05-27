import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { ClickHouseClient } from "@clickhouse/client";
import { WakaTimeProjectsSyncer } from "../wakatime-projects.syncer";

describe("WakaTimeProjectsSyncer", () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: mock(() => Promise.resolve()),
      query: mock(() => Promise.resolve()),
      close: mock(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  test("should create syncer instance", () => {
    const syncer = new WakaTimeProjectsSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be WakaTimeProjectsSyncer instance", () => {
    const syncer = new WakaTimeProjectsSyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeProjectsSyncer);
  });

  test("should throw error when WAKATIME_API_KEY is missing", async () => {
    const originalKey = process.env.WAKATIME_API_KEY;
    process.env.WAKATIME_API_KEY = undefined;

    const syncer = new WakaTimeProjectsSyncer(mockClient);

    try {
      await syncer.sync({ dryRun: true });
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("WAKATIME_API_KEY");
    }

    if (originalKey) {
      process.env.WAKATIME_API_KEY = originalKey;
    }
  });

  test("should transform projects into records correctly", async () => {
    const syncer = new WakaTimeProjectsSyncer(mockClient);

    const mockProject = {
      id: "proj-123",
      name: "monorepo",
      repository: "https://github.com/duyet/monorepo",
      last_heartbeat_at: "2026-05-25T20:30:00Z",
      has_public_url: true,
      urls: {
        main: "https://wakatime.com/projects/monorepo",
        wakatime_dashboard: "https://wakatime.com/projects/monorepo",
      },
      languages: ["TypeScript", "Rust"],
      created_at: "2023-01-15T00:00:00Z",
    };

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockProject[]) => Promise<unknown[]>;
      }
    ).transform([mockProject]);

    expect(records).toHaveLength(1);
    const record = records[0] as Record<string, unknown>;
    expect(record.project_id).toBe("proj-123");
    expect(record.name).toBe("monorepo");
    expect(record.repository).toBe("https://github.com/duyet/monorepo");
    expect(record.has_public_url).toBe(1);
    expect(record.last_heartbeat_at).toBe("2026-05-25 20:30:00");
    expect(record.created_at).toBe("2023-01-15 00:00:00");
    expect(JSON.parse(record.languages as string)).toEqual([
      "TypeScript",
      "Rust",
    ]);
  });

  test("should handle project with no repository or languages", async () => {
    const syncer = new WakaTimeProjectsSyncer(mockClient);

    const mockProject = {
      id: "proj-minimal",
      name: "scratch",
    };

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockProject[]) => Promise<unknown[]>;
      }
    ).transform([mockProject]);

    const record = records[0] as Record<string, unknown>;
    expect(record.project_id).toBe("proj-minimal");
    expect(record.repository).toBe("");
    expect(record.has_public_url).toBe(0);
    expect(JSON.parse(record.languages as string)).toEqual([]);
    expect(JSON.parse(record.urls as string)).toEqual({});
  });

  test("should fall back to top-level url fields when urls object is absent", async () => {
    const syncer = new WakaTimeProjectsSyncer(mockClient);

    const mockProject = {
      id: "proj-url-fallback",
      name: "old-project",
      url: "https://wakatime.com/projects/old-project",
      wakatime_dashboard_url: "https://wakatime.com/projects/old-project",
    };

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockProject[]) => Promise<unknown[]>;
      }
    ).transform([mockProject]);

    const record = records[0] as Record<string, unknown>;
    const urls = JSON.parse(record.urls as string);
    expect(urls.main).toBe("https://wakatime.com/projects/old-project");
  });

  test("should fetch projects with correct API URL", async () => {
    process.env.WAKATIME_API_KEY = "test-key-456";

    const syncer = new WakaTimeProjectsSyncer(mockClient);

    const mockResponse = {
      data: [
        {
          id: "proj-1",
          name: "test-project",
          created_at: "2024-01-01T00:00:00Z",
          last_heartbeat_at: "2026-05-25T00:00:00Z",
        },
      ],
    };

    const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBe(1);

    const fetchedUrl = fetchSpy.mock.calls[0][0] as string;
    expect(fetchedUrl).toContain("/users/current/projects");
    expect(fetchedUrl).toContain("api_key=test-key-456");

    fetchSpy.mockRestore();
    delete process.env.WAKATIME_API_KEY;
  });
});
