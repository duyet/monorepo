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
      <link href="/icon.svg" rel="icon" sizes="any" />

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
