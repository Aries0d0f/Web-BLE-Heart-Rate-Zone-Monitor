export const Features = {
  HEART_RATE: {
    ID: 'HEART_RATE',
    Name: 'Heart Rate',
    Icon: 'fa6-solid:heart-pulse',
    Service: 'heart_rate',
    Characteristic: 'heart_rate_measurement',
  }
} as const;

export type Feature = keyof typeof Features;

export type BluetoothDeviceHook = (device: BluetoothDevice) => void;
