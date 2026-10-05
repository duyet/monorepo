import { describe, expect, it } from "vitest";
import type { Model } from "./types";
import { groupByOrg } from "./utils";

function model(name: string, date: string, org: string): Model {
  return {
    name,
    date,
    org,
    params: null,
    type: "model",
    license: "closed",
    desc: name,
  };
}

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
