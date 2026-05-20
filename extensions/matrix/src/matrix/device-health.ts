export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleNova AIDevices: MatrixManagedDeviceInfo[];
  currentNova AIDevices: MatrixManagedDeviceInfo[];
};

const NOVA_AI_DEVICE_NAME_PREFIX = "Nova AI ";

export function isNova AIManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(NOVA_AI_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const openClawDevices = devices.filter((device) =>
    isNova AIManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleNova AIDevices: openClawDevices.filter((device) => !device.current),
    currentNova AIDevices: openClawDevices.filter((device) => device.current),
  };
}
