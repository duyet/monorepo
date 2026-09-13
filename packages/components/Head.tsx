import { DUYET_FAVICON_APPLE, DUYET_FAVICON_SVG } from "./brand/duyet-logo";
import { duyetFontHeadLinks } from "./brand/fonts";

/**
 * DNS preconnect hints for commonly used external domains
 *
 * These hints help browsers establish early connections to external resources,
 * reducing latency for fonts, APIs, and CDNs.
 */
const DNS_PREFETCH_DOMAINS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://avatars.githubusercontent.com",
  "https://github.com",
  "https://images.unsplash.com",
];

export default function Head() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta content="follow, index" name="robots" />
      <meta content="ie=edge" httpEquiv="x-ua-compatible" />
      {duyetFontHeadLinks().map((l) => (
        <link
          key={l.href + l.rel}
          rel={l.rel}
          href={l.href}
          crossOrigin={l.crossOrigin}
        />
      ))}
      <link
        href={DUYET_FAVICON_SVG}
        rel="icon"
        type="image/svg+xml"
      />
      <link href={DUYET_FAVICON_APPLE} rel="apple-touch-icon" />

      {/* DNS prefetch and preconnect hints for external domains */}
      {DNS_PREFETCH_DOMAINS.map((domain) => (
        <link key={domain} href={domain} rel="dns-prefetch" />
      ))}
      {DNS_PREFETCH_DOMAINS.map((domain) => (
        <link key={`preconnect-${domain}`} href={domain} rel="preconnect" />
      ))}
    </head>
  );
}
