export const Features = {
  HEART_RATE: {
    Name: 'Heart Rate',
    Icon: 'fa6-solid:heart-pulse',
    Service: 'heart_rate',
    Characteristic: 'heart_rate_measurement',
  }
}

export type Feature = keyof typeof Features;

export type BluetoothDeviceHook = (device: BluetoothDevice) => void;
