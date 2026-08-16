import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UpdateAvailableBanner } from "./ServiceWorkerProvider";

describe("UpdateAvailableBanner", () => {
  it("names the icon-only dismiss control", () => {
    const html = renderToStaticMarkup(
      <UpdateAvailableBanner onUpdate={() => {}} onDismiss={() => {}} />,
    );
    expect(html).toContain('aria-label="Dismiss update available"');
  });
});
