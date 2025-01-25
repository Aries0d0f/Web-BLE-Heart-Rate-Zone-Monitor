import { readonly, ref, watch } from "vue";

import type { InjectionKey } from "vue";

import { createModuleHook } from "@/modules/utils/module-factory";

import type { Context } from "@/modules/utils/context/context.model";
import type { BluetoothDeviceHook } from "./bluetooth.model";

const PROVIDE_KEY: InjectionKey<ReturnType<typeof useBluetooth$>> =
  Symbol.for("Bluetooth");

const useBluetooth$ = (_ctx?: Context) => {
  const device = ref<BluetoothDevice | null>(null);
  const onPairHooks = ref<BluetoothDeviceHook[]>([]);
  const onForgetHooks = ref<BluetoothDeviceHook[]>([]);

  const pair = (serviceFeaturesMustHave?: string[]) =>
    navigator.bluetooth
      .requestDevice(
        serviceFeaturesMustHave
          ? {
              filters: [
                {
                  services: serviceFeaturesMustHave,
                },
              ],
            }
          : undefined
      )
      .then((bleDevice) => {
        device.value = bleDevice;
        execHooks(onPairHooks.value);
      });

  const forget = () => {
    if (device.value) {
      execHooks(onForgetHooks.value);
      device.value.forget();
      device.value = null;
    }
  };

  const execHooks = (hooks: BluetoothDeviceHook[]) => {
    hooks.forEach((hook) => {
      if (device.value) {
        hook(device.value);
      }
    });
  };

  const onPair = (cb: BluetoothDeviceHook) => {
    onPairHooks.value.push(cb);
  };

  const onForget = (cb: BluetoothDeviceHook) => {
    onForgetHooks.value.push(cb);
  };

  navigator.bluetooth?.getDevices().then((devices) => {
    if (devices.length) {
      device.value = devices[0];
    }
  });

  watch(
    () => device.value,
    (value) => {
      if (value) {
        execHooks(onPairHooks.value);
      }
    },
    { immediate: true }
  );

  return {
    device: readonly(device),
    pair,
    forget,
    onPair,
    onForget,
  };
};

export const useBluetooth = createModuleHook(PROVIDE_KEY, useBluetooth$);
