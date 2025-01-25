<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";

import { Features } from "@/modules/bluetooth/bluetooth.model";
import { useBluetooth } from "@/modules/bluetooth/bluetooth.service";

import type { Feature } from "@/modules/bluetooth/bluetooth.model";

const props = defineProps<{
  feature: Feature;
}>();

const value = ref<number>();
const recycleHook = ref<() => void>();

const feature = computed(() => Features[props.feature]);

const { onPair, onForget } = useBluetooth();

onPair((device) => {
  return device.gatt?.connect().then((server) =>
    server.getPrimaryService(feature.value.Service).then((service) => {
      service
        .getCharacteristic(feature.value.Characteristic)
        .then((characteristic) => {
          characteristic.addEventListener(
            "characteristicvaluechanged",
            () => {
              const serviceValue = characteristic.value?.getInt16(0);
              if (serviceValue) {
                value.value = serviceValue;
              }
            },
            true
          );
          characteristic.startNotifications();

          recycleHook.value = () => {
            characteristic.removeEventListener(
              "characteristicvaluechanged",
              () => {
                characteristic.stopNotifications();
              }
            );
          };
        });
    })
  );
});

onForget((device) => {
  recycleHook.value?.();
  device.gatt?.disconnect();
  value.value = undefined;
});
</script>

<template>
  <div :class="[$style.card, $style.wrapper, $style.flex, $style.vertical]">
    <label>{{ feature.Name }}</label>
    <h1
      :class="[
        $style.wrapper,
        $style.flex,
        $style.vertical,
        {
          [$style.inactive]: value === undefined,
        },
      ]"
    >
      <span>{{ value ?? "--" }}</span>
      <Icon :class="$style.icon" :icon="feature.Icon" />
    </h1>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

.card {
  --wrapper-gap: 1em;

  padding: 1em;
  border-radius: 0.5em;
  background-color: var(--color-gray-900);
  place-content: center;
  place-items: center;
  min-width: 10em;

  h1 {
    --wrapper-gap: 0.2em;

    color: var(--color-white);
    font-size: 4em;
    width: fit-content;
    place-content: center;
    place-items: center;

    &.inactive {
      color: var(--color-gray-700);
    }

    > .icon {
      font-size: 0.4em;
      margin-bottom: 0.2em;
    }
  }

  label {
    color: var(--color-gray-500);
  }
}
</style>
