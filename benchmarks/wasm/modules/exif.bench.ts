export const name = "exif-parse"
export const iterations = 2000
export const wasmReady = false

// Generate a synthetic EXIF-like binary buffer (JPEG SOI + APP1 marker + TIFF header + IFD)
// This is a minimal valid EXIF structure, not a real photo, but exercises the same parsing paths.
export const input = generateExifBuffer()

function generateExifBuffer(): ArrayBuffer {
  // JPEG SOI marker
  const soi = new Uint8Array([0xff, 0xd8])

  // APP1 marker with EXIF data
  // 0xFFE1 + length (2 bytes) + "Exif\0\0" + TIFF header
  const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]) // "Exif\0\0"

  // TIFF header: little-endian (II) + magic 42 + IFD offset (8)
  const tiffHeader = new Uint8Array([
    0x49, 0x49, // Little-endian byte order
    0x2a, 0x00, // TIFF magic number 42
    0x08, 0x00, 0x00, 0x00, // Offset to first IFD
  ])

  // IFD0 with several entries
  const entries = [
    // ImageWidth (tag 0x0100, SHORT, count 1, value 1920)
    { tag: 0x0100, type: 0x0003, count: 1, value: 1920 },
    // ImageHeight (tag 0x0101, SHORT, count 1, value 1080)
    { tag: 0x0101, type: 0x0003, count: 1, value: 1080 },
    // Make (tag 0x010f, ASCII, count 6, offset to data)
    { tag: 0x010f, type: 0x0002, count: 6, value: 0x005a },
    // Model (tag 0x0110, ASCII, count 12, offset to data)
    { tag: 0x0110, type: 0x0002, count: 12, value: 0x0060 },
    // DateTime (tag 0x0132, ASCII, count 20, offset to data)
    { tag: 0x0132, type: 0x0002, count: 20, value: 0x006c },
    // Orientation (tag 0x0112, SHORT, count 1, value 1)
    { tag: 0x0112, type: 0x0003, count: 1, value: 1 },
    // XResolution (tag 0x011a, RATIONAL, count 1, offset)
    { tag: 0x011a, type: 0x0005, count: 1, value: 0x0080 },
    // YResolution (tag 0x011b, RATIONAL, count 1, offset)
    { tag: 0x011b, type: 0x0005, count: 1, value: 0x0088 },
    // Software (tag 0x0131, ASCII, count 16, offset)
    { tag: 0x0131, type: 0x0002, count: 16, value: 0x0090 },
    // ExifIFD pointer (tag 0x8769, LONG, count 1, offset)
    { tag: 0x8769, type: 0x0004, count: 1, value: 0x00a0 },
  ]

  const numEntries = entries.length
  const ifdSize = 2 + numEntries * 12 + 4 // entry count + entries + next IFD pointer
  const stringDataStart = 8 + ifdSize // after TIFF header + IFD

  // Recompute offsets relative to TIFF start
  const adjustedEntries = entries.map((e, i) => {
    if (e.type === 0x0002 || e.type === 0x0005) {
      return { ...e, value: stringDataStart + i * 16 }
    }
    return e
  })

  const parts: Uint8Array[] = [soi]

  // Build the full APP1 segment
  const totalExifLen = exifHeader.length + tiffHeader.length + ifdSize + numEntries * 16
  const app1Len = 2 + exifHeader.length + totalExifLen
  const app1Header = new Uint8Array([0xff, 0xe1, (app1Len >> 8) & 0xff, app1Len & 0xff])

  parts.push(app1Header)
  parts.push(exifHeader)
  parts.push(tiffHeader)

  // IFD entry count (LE)
  const ifdCount = new Uint8Array([numEntries & 0xff, (numEntries >> 8) & 0xff])
  parts.push(ifdCount)

  // IFD entries (12 bytes each)
  for (const entry of adjustedEntries) {
    const buf = new Uint8Array(12)
    buf[0] = entry.tag & 0xff
    buf[1] = (entry.tag >> 8) & 0xff
    buf[2] = entry.type & 0xff
    buf[3] = (entry.type >> 8) & 0xff
    buf[4] = entry.count & 0xff
    buf[5] = (entry.count >> 8) & 0xff
    buf[6] = (entry.count >> 16) & 0xff
    buf[7] = (entry.count >> 24) & 0xff
    buf[8] = entry.value & 0xff
    buf[9] = (entry.value >> 8) & 0xff
    buf[10] = (entry.value >> 16) & 0xff
    buf[11] = (entry.value >> 24) & 0xff
    parts.push(buf)
  }

  // Next IFD pointer (0 = no more IFDs)
  parts.push(new Uint8Array([0, 0, 0, 0]))

  // String data values
  const strings = [
    "Canon\0",            // Make (6 bytes)
    "EOS R5 Mark II\0",   // Model (15 bytes)
    "2026:05:01 10:30:00\0", // DateTime (20 bytes)
    "",                     // padding
    "",                     // padding
    "Lightroom Classic\0", // Software
  ]

  for (let i = 0; i < numEntries; i++) {
    const buf = new Uint8Array(16)
    const str = strings[i] || ""
    for (let j = 0; j < Math.min(str.length, 16); j++) {
      buf[j] = str.charCodeAt(j)
    }
    parts.push(buf)
  }

  // JPEG EOI marker
  parts.push(new Uint8Array([0xff, 0xd9]))

  // Combine all parts
  const totalLen = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(totalLen)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result.buffer
}

/**
 * TS EXIF parser: reads TIFF/IFD entries from a JPEG APP1 segment.
 * Returns a map of tag -> parsed value.
 */
export function tsFn(input: unknown): Record<string, unknown> {
  const buffer = input as ArrayBuffer
  const view = new DataView(buffer)

  let offset = 0
  // Check JPEG SOI
  if (view.getUint16(0) !== 0xffd8) return {}
  offset = 2

  // Check APP1
  if (view.getUint16(offset) !== 0xffe1) return {}
  offset += 4 // skip marker + length

  // Check "Exif\0\0"
  const exifSig = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3))
  if (exifSig !== "Exif") return {}
  offset += 6

  // TIFF header
  const le = view.getUint16(offset) === 0x4949 // "II" = little-endian
  offset += 2
  const magic = le ? view.getUint16(offset, true) : view.getUint16(offset)
  if (magic !== 42) return {}
  offset += 2
  const ifdOffset = le ? view.getUint32(offset, true) : view.getUint32(offset)
  offset += 4

  const tiffStart = 10 // offset of TIFF header from buffer start
  const result: Record<string, unknown> = {}

  const readString = (off: number, len: number): string => {
    let s = ""
    for (let i = 0; i < len; i++) {
      const ch = view.getUint8(off + i)
      if (ch === 0) break
      s += String.fromCharCode(ch)
    }
    return s
  }

  // Read IFD0
  const ifdPos = tiffStart + ifdOffset
  const numEntries = le ? view.getUint16(ifdPos, true) : view.getUint16(ifdPos)
  const tagNames: Record<number, string> = {
    0x0100: "ImageWidth",
    0x0101: "ImageHeight",
    0x010f: "Make",
    0x0110: "Model",
    0x0112: "Orientation",
    0x011a: "XResolution",
    0x011b: "YResolution",
    0x0131: "Software",
    0x0132: "DateTime",
    0x8769: "ExifIFD",
  }

  for (let i = 0; i < numEntries; i++) {
    const entryPos = ifdPos + 2 + i * 12
    const tag = le ? view.getUint16(entryPos, true) : view.getUint16(entryPos)
    const type = le ? view.getUint16(entryPos + 2, true) : view.getUint16(entryPos + 2)
    const count = le ? view.getUint32(entryPos + 4, true) : view.getUint32(entryPos + 4)
    const valueField = le ? view.getUint32(entryPos + 8, true) : view.getUint32(entryPos + 8)

    const name = tagNames[tag] || `Tag${tag.toString(16)}`

    if (type === 2) {
      // ASCII
      if (count <= 4) {
        result[name] = readString(entryPos + 8, count)
      } else {
        result[name] = readString(tiffStart + valueField, count)
      }
    } else if (type === 3) {
      // SHORT
      result[name] = valueField & 0xffff
    } else if (type === 4) {
      // LONG
      result[name] = valueField
    } else if (type === 5) {
      // RATIONAL
      const rOff = tiffStart + valueField
      const num = le ? view.getUint32(rOff, true) : view.getUint32(rOff)
      const den = le ? view.getUint32(rOff + 4, true) : view.getUint32(rOff + 4)
      result[name] = den > 0 ? num / den : 0
    }
  }

  return result
}

// WASM: stub
export function wasmFn(input: unknown): Record<string, unknown> {
  return tsFn(input)
}
