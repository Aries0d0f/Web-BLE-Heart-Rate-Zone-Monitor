<script setup lang="ts">
import { setupModules } from "@/modules";
import { signal } from "@/shared/signal";
import Controller from "@/components/Controller.vue";
import Monitor from "@/components/Monitor.vue";
import Preference from "@/components/Preference.vue";

setupModules();

const onShowPreference = signal(false);
</script>

<template>
  <main
    :class="[
      $style['viewport-container'],
      $style.wrapper,
      $style.flex,
      $style.vertical,
    ]"
  >
    <div
      :class="[
        $style['viewport-wrapper'],
        $style.wrapper,
        $style.flex,
        $style.horizontal,
      ]"
    >
      <Monitor feature="HEART_RATE" />
    </div>
    <Controller :on-show-preference />
  </main>
  <div
    @click.self.passive="onShowPreference.set(false)"
    id="dialog-entry"
    :class="[
      $style['viewport-dialog'],
      $style.wrapper,
      $style.flex,
      $style.vertical,
    ]"
  >
    <template v-if="onShowPreference()">
      <Preference @close="onShowPreference.set(false)" />
    </template>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

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

    @media screen and (max-width: 375px) {
      font-size: 14px;
    }

    @media screen and (max-width: 340px) {
      font-size: 12px;
    }
  }

  &-wrapper {
    --wrapper-gap: 2em;
  }

  &-dialog {
    position: fixed !important;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    flex-direction: column-reverse !important;
    pointer-events: none;
    place-content: center;
    place-items: center;
    will-change: backdrop-filter;
    transition: backdrop-filter 0.3s ease-in-out;
    container: popup / size;
    z-index: 100000;
    zoom: 1;

    &:has(*) {
      backdrop-filter: blur(6px);
      pointer-events: initial;
    }

    > * {
      position: fixed !important;
      box-shadow: 20px 28px 20px rgba(0,0,0,0.05), 9px 12px 15px rgba(0,0,0,0.09), 2px 3px 8px rgba(0,0,0,0.1);

      &::before {
        content: "";
        position: absolute;
        top: calc((100% - 100cqh) / 2);
        left: calc((100% - 100cqw) / 2);
        height: 100cqh;
        width: 100cqw;
        backdrop-filter: blur(6px);
        pointer-events: none;
        z-index: -10;
      }
    }
  }
}
</style>
