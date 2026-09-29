import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { AICodePercentageSyncer } from "../ai-code-percentage.syncer";

const REPO_URL = "https://github.com/duyet/monorepo";
const OWNER = "duyet";
const REPO = "monorepo";

interface CommitNode {
  oid: string;
  abbreviatedOid: string;
  date: string;
}

function makeCommitNode({
  oid,
  abbreviatedOid,
  date,
}: CommitNode): Record<string, unknown> {
  return {
    oid,
    abbreviatedOid,
    url: `https://api.github.com/repos/${OWNER}/${REPO}/commits/${oid}`,
    message: "feat: something",
    messageHeadline: "feat: something",
    messageBody: "",
    author: {
      name: "Duyet Le",
      email: "me@duyet.net",
      date,
    },
    committer: {
      name: "Duyet Le",
      email: "me@duyet.net",
      date,
    },
    signature: { exists: false, valid: false, method: null },
    additions: 10,
    deletions: 2,
    changedFiles: 1,
    pushedDate: date,
    committedDate: date,
    authoredDate: date,
    parents: { edges: [] },
    coAuthors: {
      edges: [{ node: { name: "Bot", email: "bot@users.noreply.github.com" } }],
    },
  };
}

const REPOS_RESPONSE = {
  data: {
    user: {
      repositories: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [{ node: { name: REPO, url: REPO_URL } }],
      },
    },
  },
};

function commitsResponse(nodes: Array<ReturnType<typeof makeCommitNode>>) {
  return {
    data: {
      repository: {
        url: REPO_URL,
        defaultBranchRef: {
          target: {
            history: {
              pageInfo: { hasNextPage: false, endCursor: null },
              edges: nodes.map((node) => ({ node })),
            },
          },
        },
      },
    },
  };
}

function mockGraphql(nodes: Array<ReturnType<typeof makeCommitNode>>) {
  return vi.spyOn(global, "fetch").mockImplementation((_input, init) => {
    const body = JSON.parse(String((init as RequestInit).body));
    const payload = body.query.includes("repositories(")
      ? REPOS_RESPONSE
      : commitsResponse(nodes);

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(payload),
    } as unknown as Response);
  });
}

function insertedRows(insert: ReturnType<typeof vi.fn>) {
  const args = insert.mock.calls[0]?.[0] as
    | {
        table: string;
        format: string;
        values: Array<Record<string, unknown>>;
      }
    | undefined;

  if (!args) {
    throw new Error("client.insert was never called");
  }

  return { ...args, rows: args.values };
}

describe("AICodePercentageSyncer", () => {
  let insert: ReturnType<typeof vi.fn>;
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    insert = vi.fn(() => Promise.resolve());
    mockClient = {
      insert,
      query: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    } as unknown as ClickHouseClient;

    vi.stubEnv("GITHUB_TOKEN", "ghp_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // Regression: `fetchFromApi` used to re-shape every commit into a synthetic
  // GraphQL envelope whose repository.url was only the owner, so `transform`
  // recomputed web_url as https://github.com/<owner>/commit/<sha> - the repo
  // name was gone. The commits are now passed through untouched.
  test("emits web_url and repo_url including the repo name", async () => {
    mockGraphql([
      makeCommitNode({
        oid: "0f1e2d3c4b5a6978",
        abbreviatedOid: "0f1e2d3",
        date: "2026-01-02T03:04:05Z",
      }),
    ]);

    const syncer = new AICodePercentageSyncer(mockClient, OWNER);
    const result = await syncer.sync({});

    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBe(1);

    const { table, format, rows } = insertedRows(insert);
    expect(table).toBe("github_commits_raw");
    expect(format).toBe("JSONEachRow");

    expect(rows[0].web_url).toBe(`${REPO_URL}/commit/0f1e2d3`);
    expect(String(rows[0].web_url)).toContain(REPO);
    expect(rows[0].repo_url).toBe(REPO_URL);
    expect(rows[0].repo).toBe(REPO);
    expect(rows[0].repo_owner).toBe(OWNER);
    expect(rows[0].date).toBe("2026-01-02");
    expect(rows[0].co_authors).toEqual(["Bot <bot@users.noreply.github.com>"]);
  });

  // The sync metadata BaseSyncer.insert adds to every record. ClickHouse drops
  // fields the target table does not declare, so these three are what
  // migration 20260929 adds to github_commits_raw.
  test("stamps the sync metadata BaseSyncer relies on for dedup", async () => {
    mockGraphql([
      makeCommitNode({
        oid: "aaaabbbb",
        abbreviatedOid: "aaaabbb",
        date: "2026-01-02T03:04:05Z",
      }),
    ]);

    const syncer = new AICodePercentageSyncer(mockClient, OWNER);
    const result = await syncer.sync({});

    expect(result.success).toBe(true);
    expect(result.recordsInserted).toBe(1);

    const { rows } = insertedRows(insert);
    expect(rows[0].sync_version).toBeGreaterThan(1_600_000_000);
    expect(rows[0].is_deleted).toBe(0);
    expect(rows[0].synced_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test("keeps a distinct web_url per commit", async () => {
    mockGraphql([
      makeCommitNode({
        oid: "11111111",
        abbreviatedOid: "1111111",
        date: "2026-01-02T03:04:05Z",
      }),
      makeCommitNode({
        oid: "22222222",
        abbreviatedOid: "2222222",
        date: "2026-01-02T03:04:06Z",
      }),
    ]);

    const syncer = new AICodePercentageSyncer(mockClient, OWNER);
    await syncer.sync({});

    const { rows } = insertedRows(insert);
    expect(rows.map((row) => row.web_url)).toEqual([
      `${REPO_URL}/commit/1111111`,
      `${REPO_URL}/commit/2222222`,
    ]);
    expect(rows.map((row) => row.sha)).toEqual(["11111111", "22222222"]);
  });

  test("fails the sync without writing when no GitHub token is set", async () => {
    vi.stubEnv("GITHUB_TOKEN", undefined);
    vi.stubEnv("GH_TOKEN", undefined);

    const syncer = new AICodePercentageSyncer(mockClient, OWNER);
    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.message).toContain("GITHUB_TOKEN");
    expect(result.recordsInserted).toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });
});
