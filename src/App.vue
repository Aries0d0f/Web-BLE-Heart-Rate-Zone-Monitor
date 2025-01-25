<script setup lang="ts">
import { setupModules } from '@/modules';
import Controller from '@/components/Controller.vue';
import Monitor from './components/Monitor.vue';

setupModules();
</script>

<template>
  <main :class="[$style['viewport-container'], $style.wrapper, $style.flex, $style.vertical]">
    <div :class="[$style['viewport-wrapper'], $style.wrapper, $style.flex, $style.horizontal]">
      <Monitor feature="HEART_RATE" />
    </div>
    <Controller />
  </main>
</template>

<style module scoped lang="scss">
@use '@/assets/styles/modules/wrapper.module' as wrapper;

.viewport {
  &-container {
    --wrapper-gap: 5em;

    background-color: var(--color-black);
    height: 100%;
    width: 100%;
    place-content: center;
    place-items: center;
  }
  
  &-wrapper {
    --wrapper-gap: 2em;
  }
}
</style>
