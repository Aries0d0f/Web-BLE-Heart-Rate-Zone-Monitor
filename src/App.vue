<script setup lang="ts">
import { ref } from "vue";

import { setupModules } from "@/modules";
import { signal } from "@/shared/signal";
import { useTimer } from "@/shared/timer";

import Controller from "@/components/Controller.vue";
import Monitor from "@/components/Monitor.vue";
import Preference from "@/components/Preference.vue";
import HeartRateZone from "@/components/HeartRateZone.vue";
import { Features } from '@/modules/bluetooth/bluetooth.model';

import type { Feature } from '@/modules/bluetooth/bluetooth.model';
import type { TimerHooks } from '@/shared/timer';

setupModules();

const meters = ref<Map<Feature, number>>(new Map());

const timerHooks = ref<TimerHooks>();
const timer = useTimer(timerHooks);

const onShowPreference = signal(false);

const setupTimerHooksHandler = (hooks: TimerHooks) => {
  timerHooks.value = hooks;
};
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
    <HeartRateZone :heart-rate="meters.get(Features.HEART_RATE.ID)" @setup-hooks="setupTimerHooksHandler" />
    <div
      :class="[
        $style['viewport-wrapper'],
        $style.wrapper,
        $style.flex,
        $style.horizontal,
      ]"
    >
      <Monitor :meters feature="HEART_RATE" />
    </div>
    <Controller :timer :on-show-preference />
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
    --wrapper-gap: 1em;
    --monitor-width: 10em;

    background-color: var(--color-black);
    height: 100%;
    width: 100%;
    place-content: center;
    place-items: center;
    font-size: 32px;
    will-change: font-size;
    transition: font-size 0.5s ease-in-out;

    @media screen and (max-width: 1680px) and (min-height: 1050px) {
      font-size: 32px;
    }

    @media screen and (max-width: 768px) and (min-height: 1024px) {
      font-size: 30px;
    }

    @media screen and (height < 1024px) {
      font-size: 28px;
    }

    @media screen and (width < 320px) {
      font-size: 24px;
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
      box-shadow: 20px 28px 20px rgba(0, 0, 0, 0.05),
        9px 12px 15px rgba(0, 0, 0, 0.09), 2px 3px 8px rgba(0, 0, 0, 0.1);

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
