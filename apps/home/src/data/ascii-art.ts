/** Web-optimized ASCII art backgrounds (from /home/duyet/project/ASCII). */
export const ASCII_ART = [
  "/art/ascii-01.webp",
  "/art/ascii-02.webp",
  "/art/ascii-03.webp",
  "/art/ascii-04.webp",
  "/art/ascii-05.webp",
  "/art/ascii-06.webp",
  "/art/ascii-07.webp",
  "/art/ascii-08.webp",
  "/art/ascii-09.webp",
  "/art/ascii-10.webp",
] as const;

export function artFor(seed: string, offset = 0): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 97;
  }
  return ASCII_ART[(hash + offset) % ASCII_ART.length];
}
