<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useStorage } from "@vueuse/core";

import { Features } from "@/modules/bluetooth/bluetooth.model";
import { useBluetooth } from "@/modules/bluetooth/bluetooth.service";

import { toggleSignal } from "@/shared/signal";
import { defaultPreferences } from "@/model/preference.model";

import type { Signal } from "@/shared/signal";
import type { Preference } from "@/model/preference.model";
import { TimerState, type Timer } from "@/shared/timer";

const preferences = useStorage<Preference>("preferences", defaultPreferences);
const props = defineProps<{
  timer: Timer;
  onShowPreference: Signal<boolean>;
}>();

const $bluetooth = useBluetooth();

const features = [Features.HEART_RATE.Service];
</script>

<template>
  <div
    :class="[
      $style['action-container'],
      $style.wrapper,
      $style.flex,
      $style.horizontal,
    ]"
  >
    <template v-if="timer.state.value === TimerState.INITIAL">
      <button
        :class="[$style.wrapper, $style.flex, $style.horizontal, $style.large]"
        @click="props.timer.start"
      >
        <Icon :class="$style.icon" icon="fa6-solid:circle-play" />
      </button>
    </template>
    <template v-else>
      <template v-if="timer.state.value === TimerState.RUNNING">
        <button
          :class="[$style.wrapper, $style.flex, $style.horizontal]"
          @click="props.timer.pause"
        >
          <Icon :class="$style.icon" icon="fa6-solid:circle-pause" />
        </button>
      </template>
      <template v-else>
        <button
          :class="[$style.wrapper, $style.flex, $style.horizontal]"
          @click="props.timer.resume"
        >
          <Icon :class="$style.icon" icon="fa6-solid:circle-play" />
        </button>
      </template>
      <h1>{{ timer.clock.value.formatted }}</h1>
      <button
        :class="[$style.wrapper, $style.flex, $style.horizontal]"
        @click="props.timer.stop"
      >
        <Icon :class="$style.icon" icon="fa6-solid:circle-stop" />
      </button>
    </template>
  </div>
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
      @click="
        () => $bluetooth.pair(preferences.showAllDevices ? undefined : features)
      "
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
    <button
      :class="[$style.wrapper, $style.flex, $style.horizontal]"
      @click="toggleSignal(props.onShowPreference)"
    >
      <Icon :class="$style.icon" icon="fa6-solid:gear" />
      <span>Preference</span>
    </button>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

.action {
  &-container {
    --wrapper-gap: 0.5em;

    width: var(--monitor-width);
    place-items: center;
    place-content: center;
    height: 3em;

    > h1 {
      margin: 0;
      color: var(--color-gray-300);
      line-height: 1;
      font-size: 1.5em;
    }

    > button {
      background-color: transparent;
      appearance: none;
      border-radius: 50%;
      border: none;
      height: fit-content;
      width: fit-content;
      cursor: pointer;

      &:hover {
        > .icon {
          background-color: var(--color-gray-300);

          > :deep(path) {
            fill: var(--color-gray-700);
          }
        }
      }

      > .icon {
        background-color: var(--color-gray-500);
        font-size: 1.7em;
        border-radius: 50%;

        > :deep(path) {
          fill: var(--color-gray-900);
          transform-origin: center;
          transform: scale(1.1);
        }
      }

      &.large {
        > .icon {
          font-size: 3em;
        }
      }
    }
  }
}

.toolbar {
  &-container {
    --wrapper-gap: 0.5em;

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
