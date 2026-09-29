/**
 * Shared photo fixture fields for the photos test suites.
 *
 * These tests only care about behaviour, not about which example image they
 * point at, so the URLs live here once instead of being copied per suite. The
 * suites keep their own photo objects — their dimensions, colours and
 * timestamps are the part each test actually varies.
 */
export const PHOTO_URLS = {
  raw: "https://example.com/raw.jpg",
  full: "https://example.com/full.jpg",
  regular: "https://example.com/regular.jpg",
  small: "https://example.com/small.jpg",
  thumb: "https://example.com/thumb.jpg",
};
