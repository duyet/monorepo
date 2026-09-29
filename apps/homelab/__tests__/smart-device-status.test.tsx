// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SmartDevicesOverview } from "../components/smart-devices/SmartDevicesOverview";
import { SmartDevicesTile } from "../components/tiles/SmartDevicesTile";
import { smartDevices } from "../lib/data";

const trulyOnline = smartDevices.filter((d) => d.status === "online").length;
const idle = smartDevices.filter((d) => d.status === "idle").length;

const readText = (ui: React.ReactElement) => {
  const { container, unmount } = render(ui);
  const text = container.textContent ?? "";
  unmount();
  return text;
};

/**
 * Two components summarise the same fleet, and so does the Lights card inside
 * `SmartDevicesOverview` (`<n>/<total> on`, which counts only
 * `status === "online"`). The headline counts must agree with that definition,
 * otherwise the page reports a device as online in one place and idle — amber
 * dot, `STATUS_DOT.idle` — in another.
 */
describe("smart device status counts", () => {
  afterEach(cleanup);

  it("has idle devices, so the two definitions actually disagree", () => {
    expect(idle).toBeGreaterThan(0);
    expect(trulyOnline).toBeLessThan(smartDevices.length);
  });

  it("SmartDevicesOverview counts only online devices as online", () => {
    const text = readText(<SmartDevicesOverview />);
    expect(text).toContain(
      `${smartDevices.length} devices · ${trulyOnline} online`
    );
    expect(text).not.toContain(
      `${smartDevices.length} devices · ${smartDevices.length} online`
    );
  });

  it("SmartDevicesOverview reports the idle devices instead of hiding them", () => {
    const text = readText(<SmartDevicesOverview />);
    expect(text).toContain(`${idle} idle`);
  });

  it("SmartDevicesTile badge numerator is the online count", () => {
    const text = readText(<SmartDevicesTile />);
    expect(text).toContain(`${trulyOnline}/${smartDevices.length}`);
    expect(text).not.toContain(
      `${smartDevices.length}/${smartDevices.length}`
    );
  });
});
