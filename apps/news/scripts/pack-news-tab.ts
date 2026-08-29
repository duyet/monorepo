#!/usr/bin/env tsx
/**
 * Pack apps/news-tab (unpacked MV3 tree) into public/news-tab.zip so the
 * news Worker can serve https://news.duyet.net/news-tab.zip.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultNewsTabRoot,
  defaultNewsTabZipDest,
  writeNewsTabZip,
} from "../src/lib/news-tab-zip";

const newsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const result = writeNewsTabZip({
  root: defaultNewsTabRoot(newsRoot),
  dest: defaultNewsTabZipDest(newsRoot),
});
console.log(
  `news-tab zip: ${result.dest} (${result.files} files, ${result.bytes} bytes)`
);
