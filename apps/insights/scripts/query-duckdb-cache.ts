#!/usr/bin/env bun
import { DuckDBInstance } from "@duckdb/node-api";
import { ANALYTICS_CACHE_PATH } from "../lib/analytics-cache-path";

const query = process.argv[2];
if (!query) {
  throw new Error("Usage: query-duckdb-cache.ts <sql>");
}

const instance = await DuckDBInstance.create(ANALYTICS_CACHE_PATH, {
  access_mode: "READ_ONLY",
});
const connection = await instance.connect();

try {
  const reader = await connection.runAndReadAll(query);
  console.log(JSON.stringify(reader.getRowObjectsJson()));
} finally {
  connection.closeSync();
  instance.closeSync();
}
