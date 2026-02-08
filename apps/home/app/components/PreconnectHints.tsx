/**
 * PreconnectHints component
 *
 * Adds preconnect hints for external domains to improve performance.
 * This tells the browser to initiate early connections to external origins
 * that will be used later, reducing latency.
 *
 * Key domains:
 * - GitHub (social links)
 * - LinkedIn (social links)
 * - Unsplash (background images)
 * - Auth0 (authentication)
 * - Analytics services
 */
export default function PreconnectHints() {
  const domains = [
    "https://github.com",
    "https://linkedin.com",
    "https://images.unsplash.com",
    "https://duyet.us.auth0.com",
  ];

  return (
    <>
      {domains.map((domain) => (
        <link key={domain} rel="preconnect" href={domain} crossOrigin="anonymous" />
      ))}
    </>
  );
}
