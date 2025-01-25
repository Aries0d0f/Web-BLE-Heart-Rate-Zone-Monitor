<script setup lang="ts">
import { Icon } from "@iconify/vue";

import { Features } from "@/modules/bluetooth/bluetooth.model";
import { useBluetooth } from "@/modules/bluetooth/bluetooth.service";

const $bluetooth = useBluetooth();

const features = [Features.HEART_RATE.Service];
</script>

<template>
  <div
    :class="[
      $style['toolbar-container'],
      $style.wrapper,
      $style.flex,
      $style.vertical,
    ]"
  >
    <button
      :class="[$style.wrapper, $style.flex, $style.horizontal]"
      @click="() => $bluetooth.pair(features)"
    >
      <Icon :class="$style.icon" icon="fa6-brands:bluetooth" />
      <span>Connect</span>
    </button>
    <button
      :class="[$style.wrapper, $style.flex, $style.horizontal]"
      @click="() => $bluetooth.forget()"
    >
      <Icon :class="$style.icon" icon="fa6-solid:link-slash" />
      <span>Disconnect</span>
    </button>
    <button :class="[$style.wrapper, $style.flex, $style.horizontal]" @click="">
      <Icon :class="$style.icon" icon="fa6-solid:gear" />
      <span>Preference</span>
    </button>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

.toolbar {
  &-container {
    --wrapper-gap: 1em;

    > button {
      --wrapper-gap: 1em;

      padding: 0.5em 1em;
      appearance: none;
      background-color: var(--color-gray-900);
      color: var(--color-gray-500);
      border-radius: 0.5em;
      border: none;
      font-weight: bold;
      place-items: center;
      width: var(--monitor-width);
      cursor: pointer;

      &:hover {
        background-color: var(--color-gray-700);

        &,
        > .icon {
          color: var(--color-gray-300);
        }
      }

      > span {
        padding-right: 1em;
      }

      > .icon {
        font-size: 1em;
        height: 1em;
        width: 1em;
        color: inherit;
      }
    }
  }
}
</style>
