#!/usr/bin/env bun
/**
 * generate-data-json.ts — Generate public/data.json for download
 */

import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { models } from '../lib/data'

const OUTPUT_PATH = resolve(process.cwd(), 'public/data.json')

function main() {
  const output = JSON.stringify(models, null, 2)
  writeFileSync(OUTPUT_PATH, output, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH} (${models.length} models)`)
}

main()
