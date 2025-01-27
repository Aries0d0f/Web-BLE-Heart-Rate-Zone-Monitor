<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";

import { Features } from "@/modules/bluetooth/bluetooth.model";
import { useBluetooth } from "@/modules/bluetooth/bluetooth.service";

import type { Feature } from "@/modules/bluetooth/bluetooth.model";

const props = defineProps<{
  feature: Feature;
  meters: Map<Feature, number>;
}>();

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
              if (characteristic.value) {
                props.meters.set(
                  feature.value.ID,
                  new Uint8Array(characteristic.value.buffer)[1]
                );
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
  props.meters.delete(feature.value.ID);
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
          [$style.inactive]: !props.meters.has(feature.ID),
        },
      ]"
    >
      <span>{{ props.meters.get(feature.ID) ?? "--" }}</span>
      <Icon
        :class="[
          $style.icon,
          {
            [$style[feature.Animation]]: props.meters.get(feature.ID),
          },
        ]"
        :style="{
          '--animation-rate': `${60 / (props.meters.get(feature.ID) || 60)}s`,
        }"
        :icon="feature.Icon"
      />
    </h1>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;
@import "@/assets/styles/libs/animation";

.card {
  --wrapper-gap: 1em;

  padding: 1em;
  border-radius: 0.5em;
  background-color: var(--color-gray-900);
  place-content: center;
  place-items: center;
  width: var(--monitor-width);

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

      &.heartbeat {
        transform-origin: center;
        animation: heartbeat var(--animation-rate) infinite;
      }
    }
  }

  label {
    color: var(--color-gray-500);
    font-size: 1em;
    font-weight: bold;
  }
}
</style>
