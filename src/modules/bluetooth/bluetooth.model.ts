export const Features = {
  HEART_RATE: {
    ID: "HEART_RATE",
    Name: "Heart Rate",
    Icon: "fa6-solid:heart-pulse",
    Service: "heart_rate",
    Characteristic: "heart_rate_measurement",
  },
} as const;

export enum BluetoothStatus {
  UNKNOWN = "UNKNOWN",
  UNSUPPORTED = "UNSUPPORTED",
  UNAUTHORIZED = "UNAUTHORIZED",
  DISABLED = "DISABLED",
  NORMAL = "NORMAL",
}

export type Feature = keyof typeof Features;

export type BluetoothDeviceHook = (device: BluetoothDevice) => void;
