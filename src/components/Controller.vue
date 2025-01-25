<script setup lang="ts">
import { Features } from '@/modules/bluetooth/bluetooth.model';
import { useBluetooth } from '@/modules/bluetooth/bluetooth.service';

const $bluetooth = useBluetooth();

const features = [Features.HEART_RATE.Service];
</script>

<template>
  <div :class="[$style.wrapper, $style.flex, $style.horizontal]">
    <button @click="() => $bluetooth.pair(features)">Pair</button>
    <button @click="() => $bluetooth.forget()">Disconnect</button>
  </div>
</template>

<style module scoped lang="scss">
@use '@/assets/styles/modules/wrapper.module' as wrapper;

.wrapper {
  --wrapper-gap: 1em;
}

button {
  appearance: none;
  background-color: var(--color-gray-800);
  color: var(--color-gray-300);
  border-radius: 0.5em;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;

  &:hover {
    background-color: var(--color-gray-700);
  }
}
</style>