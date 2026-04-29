#!/usr/bin/env bun
import { createClient } from "@clickhouse/client";
import { DuckDBInstance } from "@duckdb/node-api";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ANALYTICS_CACHE_PATH } from "../lib/analytics-cache-path";

type QuerySpec = {
  table: string;
  createSql: string;
  query: string;
  queryParams?: Record<string, unknown>;
};

const UNSPLASH_USERNAME = process.env.UNSPLASH_USERNAME;

function getLocalPort(): number {
  return Number(process.env.CLICKHOUSE_SSH_LOCAL_PORT || "18123");
}

function useSshClickHouse(): boolean {
  return (
    process.env.CLICKHOUSE_USE_SSH === "1" ||
    process.env.CLICKHOUSE_USE_SSH_TUNNEL === "1"
  );
}

function getSshHost(): string {
  const sshHost = process.env.CLICKHOUSE_SSH_HOST;
  if (!sshHost) {
    throw new Error("Missing ClickHouse SSH env: CLICKHOUSE_SSH_HOST");
  }
  return sshHost;
}

function getClickHouseConfig() {
  const useSsh = useSshClickHouse();
  const host = useSsh ? "127.0.0.1" : process.env.CLICKHOUSE_HOST;
  const port = useSsh ? String(getLocalPort()) : process.env.CLICKHOUSE_PORT || "8123";
  const user = process.env.CLICKHOUSE_USER;
  const password = process.env.CLICKHOUSE_PASSWORD;
  const database = process.env.CLICKHOUSE_DATABASE;
  const protocol =
    (useSsh ? "http" : process.env.CLICKHOUSE_PROTOCOL) ||
    (["443", "8443", "9440"].includes(port) ? "https" : "http");

  const missing = [];
  if (!host) missing.push("CLICKHOUSE_HOST");
  if (!user) missing.push("CLICKHOUSE_USER");
  if (!password) missing.push("CLICKHOUSE_PASSWORD");
  if (!database) missing.push("CLICKHOUSE_DATABASE");
  if (missing.length > 0) {
    throw new Error(`Missing ClickHouse env: ${missing.join(", ")}`);
  }

  return {
    url: `${protocol}://${host}:${port}`,
    username: user!,
    password: password!,
    database: database!,
  };
}

const querySpecs: QuerySpec[] = [
  {
    table: "ccusage_usage_daily",
    createSql: `
      CREATE TABLE ccusage_usage_daily (
        date DATE,
        total_tokens DOUBLE,
        input_tokens DOUBLE,
        output_tokens DOUBLE,
        cache_creation_tokens DOUBLE,
        cache_read_tokens DOUBLE,
        total_cost DOUBLE
      )
    `,
    query: `
      SELECT
        date,
        total_tokens,
        input_tokens,
        output_tokens,
        cache_creation_tokens,
        cache_read_tokens,
        total_cost
      FROM ccusage_usage_daily
      ORDER BY date ASC
    `,
  },
  {
    table: "ccusage_model_breakdowns",
    createSql: `
      CREATE TABLE ccusage_model_breakdowns (
        created_at TIMESTAMP,
        model_name VARCHAR,
        input_tokens DOUBLE,
        output_tokens DOUBLE,
        cache_creation_tokens DOUBLE,
        cache_read_tokens DOUBLE,
        cost DOUBLE
      )
    `,
    query: `
      SELECT
        created_at,
        model_name,
        input_tokens,
        output_tokens,
        cache_creation_tokens,
        cache_read_tokens,
        cost
      FROM ccusage_model_breakdowns
      ORDER BY created_at ASC
    `,
  },
  {
    table: "ccusage_usage_sessions",
    createSql: `
      CREATE TABLE ccusage_usage_sessions (
        session_id VARCHAR,
        project_path VARCHAR,
        total_tokens DOUBLE,
        total_cost DOUBLE,
        last_activity TIMESTAMP
      )
    `,
    query: `
      SELECT
        session_id,
        project_path,
        total_tokens,
        total_cost,
        last_activity
      FROM ccusage_usage_sessions
      ORDER BY last_activity DESC
    `,
  },
  {
    table: "monorepo_unsplash_photos",
    createSql: `
      CREATE TABLE monorepo_unsplash_photos (
        photo_id VARCHAR,
        provider VARCHAR,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        promoted_at TIMESTAMP,
        width BIGINT,
        height BIGINT,
        color VARCHAR,
        blur_hash VARCHAR,
        description VARCHAR,
        alt_description VARCHAR,
        url_raw VARCHAR,
        url_full VARCHAR,
        url_regular VARCHAR,
        url_small VARCHAR,
        url_thumb VARCHAR,
        link_self VARCHAR,
        link_html VARCHAR,
        link_download VARCHAR,
        link_download_location VARCHAR,
        likes BIGINT,
        downloads BIGINT,
        views BIGINT,
        location_name VARCHAR,
        location_city VARCHAR,
        location_country VARCHAR,
        location_latitude DOUBLE,
        location_longitude DOUBLE,
        exif_make VARCHAR,
        exif_model VARCHAR,
        exif_exposure_time VARCHAR,
        exif_aperture VARCHAR,
        exif_focal_length VARCHAR,
        exif_iso BIGINT,
        user_id VARCHAR,
        user_username VARCHAR,
        user_name VARCHAR,
        user_profile_image_small VARCHAR,
        user_profile_image_medium VARCHAR,
        user_profile_image_large VARCHAR,
        user_link_html VARCHAR,
        raw_data VARCHAR,
        sync_version BIGINT,
        is_deleted BIGINT,
        synced_at TIMESTAMP
      )
    `,
    query: `
      SELECT
        photo_id,
        provider,
        created_at,
        updated_at,
        promoted_at,
        width,
        height,
        color,
        blur_hash,
        description,
        alt_description,
        url_raw,
        url_full,
        url_regular,
        url_small,
        url_thumb,
        link_self,
        link_html,
        link_download,
        link_download_location,
        likes,
        downloads,
        views,
        location_name,
        location_city,
        location_country,
        location_latitude,
        location_longitude,
        exif_make,
        exif_model,
        exif_exposure_time,
        exif_aperture,
        exif_focal_length,
        exif_iso,
        user_id,
        user_username,
        user_name,
        user_profile_image_small,
        user_profile_image_medium,
        user_profile_image_large,
        user_link_html,
        raw_data,
        sync_version,
        is_deleted,
        synced_at
      FROM monorepo_unsplash_photos FINAL
      WHERE is_deleted = 0
        AND user_username = {username:String}
      ORDER BY created_at DESC
      LIMIT 500
    `,
    queryParams: { username: UNSPLASH_USERNAME },
  },
];

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function materializeQueryParams(
  query: string,
  params: Record<string, unknown> = {}
): string {
  return query.replaceAll(/\{([a-zA-Z0-9_]+):String\}/g, (_match, name) => {
    const value = params[name];
    if (typeof value !== "string") {
      throw new Error(`Missing string query param: ${name}`);
    }
    return sqlString(value);
  });
}

async function runSshClickHouseQuery(
  query: string,
  queryParams?: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const missing = [];
  if (!process.env.CLICKHOUSE_USER) missing.push("CLICKHOUSE_USER");
  if (!process.env.CLICKHOUSE_PASSWORD) missing.push("CLICKHOUSE_PASSWORD");
  if (!process.env.CLICKHOUSE_DATABASE) missing.push("CLICKHOUSE_DATABASE");
  if (missing.length > 0) {
    throw new Error(`Missing ClickHouse env: ${missing.join(", ")}`);
  }

  const formattedQuery = materializeQueryParams(query, queryParams)
    .trim()
    .replace(/;$/, "");
  const encodedQuery = Buffer.from(formattedQuery, "utf8").toString("base64");
  const command = [
    `printf %s ${JSON.stringify(encodedQuery)} | base64 -d |`,
    `CLICKHOUSE_PASSWORD=${JSON.stringify(process.env.CLICKHOUSE_PASSWORD)}`,
    "clickhouse client --multiquery",
    "--host 127.0.0.1",
    `--port ${JSON.stringify(process.env.CLICKHOUSE_NATIVE_PORT || "9000")}`,
    `--user ${JSON.stringify(process.env.CLICKHOUSE_USER)}`,
    `--database ${JSON.stringify(process.env.CLICKHOUSE_DATABASE)}`,
    "--format JSONEachRow",
  ].join(" ");

  const ssh = spawnSync("ssh", [getSshHost(), command], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });

  if (ssh.status !== 0) {
    throw new Error(`SSH ClickHouse query failed: ${ssh.stderr.trim()}`);
  }

  return ssh.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function fetchRows(
  client: ReturnType<typeof createClient>,
  spec: QuerySpec
) {
  if (useSshClickHouse()) {
    return runSshClickHouseQuery(spec.query, spec.queryParams);
  }

  const result = await client.query({
    query: spec.query,
    format: "JSONEachRow",
    query_params: spec.queryParams,
  });

  const rows = await result.json<Record<string, unknown>>();
  return Array.isArray(rows) ? rows : [];
}

async function replaceTable(
  connection: Awaited<ReturnType<DuckDBInstance["connect"]>>,
  spec: QuerySpec,
  rows: Record<string, unknown>[],
  tempDir: string
) {
  await connection.run(`DROP TABLE IF EXISTS ${spec.table}`);
  await connection.run(spec.createSql);

  if (rows.length === 0) return;

  const tempPath = join(tempDir, `${spec.table}.jsonl`);
  writeFileSync(tempPath, rows.map((row) => JSON.stringify(row)).join("\n"));
  await connection.run(`
    INSERT INTO ${spec.table}
    SELECT * FROM read_json_auto(${sqlString(tempPath)}, format='newline_delimited')
  `);
}

async function main() {
  if (!UNSPLASH_USERNAME) {
    throw new Error("Missing Unsplash env: UNSPLASH_USERNAME");
  }

  const cachePath = ANALYTICS_CACHE_PATH;
  const tempPath = `${cachePath}.tmp`;
  const tempDir = mkdtempSync(join(tmpdir(), "analytics-cache-"));

  console.log(`Syncing ClickHouse data into ${cachePath}`);
  mkdirSync(dirname(cachePath), { recursive: true });

  if (existsSync(tempPath)) {
    rmSync(tempPath);
  }

  const clickhouse = createClient({
    ...getClickHouseConfig(),
    request_timeout: 60_000,
    clickhouse_settings: {
      max_execution_time: 60,
      max_result_rows: "100000",
    },
  });

  const instance = await DuckDBInstance.create(tempPath);
  const connection = await instance.connect();

  try {
    for (const spec of querySpecs) {
      const rows = await fetchRows(clickhouse, spec);
      await replaceTable(connection, spec, rows, tempDir);
      console.log(`  ${spec.table}: ${rows.length} rows`);
    }

    await connection.run(`
      CREATE OR REPLACE TABLE cache_metadata AS
      SELECT
        current_timestamp AS synced_at,
        ${sqlString(UNSPLASH_USERNAME!)} AS unsplash_username
    `);

    connection.closeSync();
    instance.closeSync();

    if (existsSync(cachePath)) {
      rmSync(cachePath);
    }
    await Bun.write(cachePath, Bun.file(tempPath));
    rmSync(tempPath);
  } finally {
    await clickhouse.close();
    rmSync(tempDir, { force: true, recursive: true });
  }

  console.log("DuckDB cache sync complete");
}

await main();
