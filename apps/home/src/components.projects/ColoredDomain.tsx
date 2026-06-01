/**
 * Renders a domain with colored segments for visual scanning.
 *
 * Patterns:
 *   mcp.duyet.net          → <accent>mcp</accent>.duyet.net
 *   github.com/duyet/ccr    → <muted>github.com</muted>/duyet/ccr
 *   chmonitor.dev            → <accent>chmonitor</accent>.dev
 *   duyet.github.io/llm…    → <muted>duyet.github.io</muted>/llm…
 */
export function ColoredDomain({ domain }: { domain: string }) {
  // github.com/path — color the host, mute the path
  if (domain.startsWith("github.com")) {
    const [host, ...rest] = domain.split("/");
    return (
      <>
        <span className="text-[var(--rd-text-2)]">{host}</span>
        {rest.length > 0 && (
          <span className="text-[var(--rd-text-4)]">/{rest.join("/")}</span>
        )}
      </>
    );
  }

  // *.duyet.net(/path) — color the subdomain, mute the rest
  const duyetMatch = domain.match(/^([^.]+)(\.duyet\.net(?:\/.*)?)$/);
  if (duyetMatch) {
    return (
      <>
        <span className="text-[var(--rd-accent-ink)]">{duyetMatch[1]}</span>
        <span className="text-[var(--rd-text-4)]">{duyetMatch[2]}</span>
      </>
    );
  }

  // *.github.io(/path)
  const ghIoMatch = domain.match(/^([^.]+)(\.github\.io(?:\/.*)?)$/);
  if (ghIoMatch) {
    return (
      <>
        <span className="text-[var(--rd-text-3)]">{ghIoMatch[1]}</span>
        <span className="text-[var(--rd-text-4)]">{ghIoMatch[2]}</span>
      </>
    );
  }

  // external domain — color the name, mute the TLD
  const tldMatch = domain.match(/^([^.]+)(\.[^.]+(?:\.[^.]+)?(?:\/.*)?)$/);
  if (tldMatch) {
    return (
      <>
        <span className="text-[var(--rd-accent-ink)]">{tldMatch[1]}</span>
        <span className="text-[var(--rd-text-4)]">{tldMatch[2]}</span>
      </>
    );
  }

  // fallback
  return <>{domain}</>;
}
