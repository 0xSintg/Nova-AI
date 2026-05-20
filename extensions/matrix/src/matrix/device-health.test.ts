import { describe, expect, it } from "vitest";
import { isNova AIManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects Nova AI-managed device names", () => {
    expect(isNova AIManagedMatrixDevice("Nova AI Gateway")).toBe(true);
    expect(isNova AIManagedMatrixDevice("Nova AI Debug")).toBe(true);
    expect(isNova AIManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isNova AIManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale Nova AI-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "Nova AI Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "Nova AI Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "Nova AI Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentNova AIDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "Nova AI Gateway",
          current: true,
        },
      ],
      staleNova AIDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "Nova AI Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "Nova AI Debug",
          current: false,
        },
      ],
    });
  });
});
