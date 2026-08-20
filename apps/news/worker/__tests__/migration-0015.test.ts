import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(dirname, "../../migrations/0015_mail.sql"),
  "utf-8"
);

describe("migration 0015_mail", () => {
  it("creates campaign, template, send, source, and rate-limit tables", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS email_templates/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS email_campaigns/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS email_sends/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS subscriber_sources/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS subscribe_attempts/);
  });

  it("does not alter the existing subscribers table", () => {
    expect(sql).not.toMatch(/ALTER TABLE subscribers/);
  });
});
