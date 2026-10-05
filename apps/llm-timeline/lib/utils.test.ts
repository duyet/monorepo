import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import {
  DEFAULT_FILTERS,
  filterModels,
  formatDate,
  getLicenseBadgeVariant,
  getLicenseBarColor,
  getSourceBadgeVariant,
  getStats,
  getTypeBadgeVariant,
  groupByOrg,
  groupByYear,
} from "./utils";

const model = (name: string, date: string, org = "Test Org"): Model => ({
  name,
  date,
  org,
  params: null,
  type: "model",
  license: "open",
  desc: `${name} description`,
});

const fixture: Model[] = [
  {
    name: "GPT-4",
    date: "2023-03-14",
    org: "OpenAI",
    params: "1.8T",
    type: "model",
    license: "closed",
    desc: "A large multimodal model",
    source: "curated",
  },
  {
    name: "Llama 2",
    date: "2024-07-18",
    org: "Meta",
    params: "70B",
    type: "model",
    license: "open",
    desc: "An open weight model",
    source: "epoch",
  },
  {
    name: "GPT-4o",
    date: "2024-05-13",
    org: "OpenAI",
    params: null,
    type: "model",
    license: "closed",
    desc: "An omni model",
    source: "curated",
  },
  {
    name: "Transformer paper",
    date: "2017-06-12",
    org: "Google",
    params: null,
    type: "milestone",
    license: "open",
    desc: "Attention is all you need",
  },
];

describe("groupByYear", () => {
  it("groups models by release year, newest first within each year", () => {
    const gpt4 = model("GPT-4", "2023-03-14");
    const llama2 = model("Llama 2", "2023-07-18");
    const gpt4o = model("GPT-4o", "2024-05-13");

    const groups = groupByYear([gpt4, gpt4o, llama2]);

    expect(Array.from(groups.keys())).toEqual([2023, 2024]);
    expect(groups.get(2023)).toEqual([llama2, gpt4]);
    expect(groups.get(2024)).toEqual([gpt4o]);
  });

  it("returns an empty map for no models", () => {
    expect(groupByYear([])).toEqual(new Map());
  });
});

describe("groupByOrg", () => {
  it("groups a small fixture by org, newest first, larger orgs first", () => {
    const older = model("GPT-3", "2020-06-11", "OpenAI");
    const newer = model("GPT-4", "2023-03-14", "OpenAI");
    const other = model("Claude", "2023-03-14", "Anthropic");

    const grouped = groupByOrg([older, other, newer]);

    expect([...grouped.keys()]).toEqual(["OpenAI", "Anthropic"]);
    expect(grouped.get("OpenAI")).toEqual([newer, older]);
    expect(grouped.get("Anthropic")).toEqual([other]);
  });
});

describe("formatDate", () => {
  it("formats a timestamp as a short US month and day", () => {
    expect(formatDate("2026-03-04T12:00:00.000Z")).toBe("Mar 4");
  });
});

describe("getStats", () => {
  it("aggregates a small fixture into counts and source totals", () => {
    expect(getStats(fixture)).toEqual({
      total: 4,
      models: 3,
      milestones: 1,
      organizations: 3,
      years: 3,
      open: 2,
      closed: 2,
      sources: { curated: 2, epoch: 1 },
    });
  });
});

describe("getTypeBadgeVariant", () => {
  it("returns the milestone badge for a milestone", () => {
    expect(getTypeBadgeVariant("milestone")).toBe("milestone");
  });
});

describe("getLicenseBadgeVariant", () => {
  it("maps each license to its badge variant", () => {
    expect(getLicenseBadgeVariant("open")).toBe("open");
    expect(getLicenseBadgeVariant("closed")).toBe("closed");
    expect(getLicenseBadgeVariant("partial")).toBe("partial");
  });

  it("falls back to default for an unknown license", () => {
    expect(getLicenseBadgeVariant("other" as Model["license"])).toBe("default");
  });
});

describe("getLicenseBarColor", () => {
  it("maps each license to its bar color", () => {
    expect(getLicenseBarColor("open")).toBe("var(--rd-ok)");
    expect(getLicenseBarColor("closed")).toBe("var(--rd-down)");
    expect(getLicenseBarColor("partial")).toBe("var(--rd-accent)");
  });
});

describe("getSourceBadgeVariant", () => {
  it("maps known sources and falls back to default", () => {
    expect(getSourceBadgeVariant("curated")).toBe("curated");
    expect(getSourceBadgeVariant("epoch")).toBe("epoch");
    expect(getSourceBadgeVariant("papers")).toBe("default");
    expect(getSourceBadgeVariant(undefined)).toBe("default");
  });
});

describe("filterModels", () => {
  const filterFixture: Model[] = [
    {
      name: "GPT-4o",
      date: "2024-05-13",
      org: "OpenAI",
      params: "200B",
      type: "model",
      license: "closed",
      desc: "flagship",
      source: "curated",
      domain: "Language",
    },
    {
      name: "Llama 3",
      date: "2024-04-18",
      org: "Meta",
      params: "8B",
      type: "model",
      license: "open",
      desc: "open weights",
      source: "curated",
      domain: "Language, Vision",
    },
    {
      // Meta but closed: matches the org filter alone, fails the license one.
      name: "Meta Closed",
      date: "2024-07-01",
      org: "Meta",
      params: "70B",
      type: "model",
      license: "closed",
      desc: "closed weights",
      source: "curated",
      domain: "Language",
    },
    {
      // Open but not Meta: matches the license filter alone.
      name: "Mistral Open",
      date: "2024-07-15",
      org: "Mistral",
      params: "7B",
      type: "model",
      license: "open",
      desc: "open weights",
      source: "curated",
      domain: "Language",
    },
  ];

  it("returns the models matching both the org and the license", () => {
    expect(
      filterModels(filterFixture, {
        ...DEFAULT_FILTERS,
        org: "Meta",
        license: "open",
      }),
    ).toEqual([filterFixture[1]]);
  });

  it("excludes a same-org model once the license filter rules it out", () => {
    expect(
      filterModels(filterFixture, { ...DEFAULT_FILTERS, org: "Meta" }),
    ).toEqual([filterFixture[1], filterFixture[2]]);

    expect(
      filterModels(filterFixture, { ...DEFAULT_FILTERS, license: "open" }),
    ).toEqual([filterFixture[1], filterFixture[3]]);
  });
});
