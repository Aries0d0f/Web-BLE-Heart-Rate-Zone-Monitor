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
    --monitor-width: 10em;

    background-color: var(--color-black);
    height: 100%;
    width: 100%;
    place-content: center;
    place-items: center;
    font-size: 32px;
    will-change: font-size;
    transition: font-size 0.5s ease-in-out;

    @media screen and (max-width: 1680px) {
      font-size: 24px;
    }

    @media screen and (max-width: 1400px) {
      font-size: 20px;
    }

    @media screen and (max-width: 1024px) {
      font-size: 18px;
    }

    @media screen and (max-width: 768px) {
      font-size: 16px;
    }
  }
  
  &-wrapper {
    --wrapper-gap: 2em;
  }
}
</style>
