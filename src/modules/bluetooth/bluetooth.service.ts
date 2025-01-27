import { nextTick, readonly, ref, watch } from "vue";

import type { InjectionKey } from "vue";

import { createModuleHook } from "@/modules/utils/module-factory";
import { BluetoothStatus } from "./bluetooth.model";

import type { Context } from "@/modules/utils/context/context.model";
import type { BluetoothDeviceHook } from "./bluetooth.model";

const PROVIDE_KEY: InjectionKey<ReturnType<typeof useBluetooth$>> =
  Symbol.for("Bluetooth");

const useBluetooth$ = (_ctx?: Context) => {
  const status = ref<BluetoothStatus>(BluetoothStatus.UNKNOWN);
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
          : {
              acceptAllDevices: true,
            }
      )
      .then((bleDevice) => {
        device.value = bleDevice;
        execHooks(onPairHooks.value);

        bleDevice.ongattserverdisconnected = () => {
          forget();
        };
        bleDevice.onserviceremoved = () => {
          forget();
        };
      });

  const forget = () => {
    if (device.value) {
      execHooks(onForgetHooks.value);
      device.value.forget();

      nextTick(() => {
        device.value = null;
      });
    }
  };

  const execHooks = (hooks: BluetoothDeviceHook[]) => {
    hooks.forEach((hook) => {
      if (device.value) {
        hook(device.value)?.catch((exception) => {
          if (
            exception instanceof Error &&
            exception.message.includes("no longer")
          ) {
            forget();
          }
        });
      }
    });
  };

  const onPair = (cb: BluetoothDeviceHook) => {
    onPairHooks.value.push(cb);
  };

  const onForget = (cb: BluetoothDeviceHook) => {
    onForgetHooks.value.push(cb);
  };

  const checkState = () => {
    if (!navigator.bluetooth) {
      status.value = BluetoothStatus.UNSUPPORTED;
    } else {
      navigator.permissions
        .query({ name: "bluetooth" as PermissionName })
        .then((result) => {
          if (result.state === "denied" || result.state === "prompt") {
            status.value = BluetoothStatus.UNAUTHORIZED;
          }
        })
        .catch(() => {
          status.value = BluetoothStatus.UNKNOWN;
        })
        .finally(() => {
          navigator.bluetooth.getAvailability().then((isAvailable) => {
            if (isAvailable) {
              status.value = BluetoothStatus.NORMAL;
            } else {
              status.value = BluetoothStatus.DISABLED;
            }
          });
        });
    }
  };

  navigator.bluetooth?.getDevices?.().then((devices) => {
    if (devices.length && devices[0] && devices[0].gatt?.connected) {
      device.value = devices[0];
    }
  });

  watch(() => navigator.bluetooth, checkState, { immediate: true, deep: true });

  watch(
    () => device.value,
    (value) => {
      if (value) {
        execHooks(onPairHooks.value);
      } else {
        execHooks(onForgetHooks.value);
      }
    },
    { immediate: true }
  );

  return {
    device: readonly(device),
    status: readonly(status),
    pair,
    forget,
    onPair,
    onForget,
  };
};

export const useBluetooth = createModuleHook(PROVIDE_KEY, useBluetooth$);
