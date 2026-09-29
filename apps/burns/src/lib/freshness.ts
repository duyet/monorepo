/**
 * Build-freshness policy for `scripts/fetch-burns-data.ts`.
 *
 * Split out from the script so the policy is unit-testable: the script's
 * module body connects to MotherDuck on import, so importing it from a test
 * would require a live token.
 *
 * `main`, cron (`schedule`), and manual (`workflow_dispatch`) deploys must
 * refresh. Pull-request previews and local runs keep the committed snapshot.
 */
export function requiresFreshBurnsData(
  eventName = process.env.GITHUB_EVENT_NAME,
  ref = process.env.GITHUB_REF,
): boolean {
  return (
    eventName === "schedule" ||
    eventName === "workflow_dispatch" ||
    ref === "refs/heads/main"
  );
}
