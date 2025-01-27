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
      {
        [$style.chart]: preferences.enableChart && timer.state.value !== TimerState.INITIAL,
      },
    ]"
  >
    <template v-if="timer.state.value === TimerState.INITIAL">
      <button
        @click="props.timer.start"
        :class="[$style.wrapper, $style.flex, $style.horizontal, $style.large]"
        aria-label="Start Timer"
      >
        <Icon :class="[$style.icon, $style.align]" icon="fa6-solid:play" />
      </button>
    </template>
    <template v-else>
      <template v-if="timer.state.value === TimerState.RUNNING">
        <button
          @click="props.timer.pause"
          :class="[$style.wrapper, $style.flex, $style.horizontal]"
          aria-label="Pause Timer"
        >
          <Icon :class="$style.icon" icon="fa6-solid:pause" />
        </button>
      </template>
      <template v-else>
        <button
          @click="props.timer.resume"
          :class="[$style.wrapper, $style.flex, $style.horizontal]"
          aria-label="Resume Timer"
        >
          <Icon :class="[$style.icon, $style.align]" icon="fa6-solid:play" />
        </button>
      </template>
      <h1>{{ timer.clock.value.formatted }}</h1>
      <button
        @click="props.timer.stop"
        :class="[$style.wrapper, $style.flex, $style.horizontal]"
        aria-label="Stop Timer"
      >
        <Icon :class="$style.icon" icon="fa6-solid:stop" />
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
    will-change: margin, height;
    transition: margin 0.1s linear, height 0.1s linear;

    @media screen and (max-height: 690px) and (max-width: 375px) {
      height: 2em;
    }

    &.chart {
      margin-bottom: clamp(1em, calc(100cqh - 6em - 22.5em), 100cqh);

      @media screen and (max-height: 720px) {
        margin-bottom: 0;
      }
    }

    > h1 {
      margin: 0;
      color: var(--color-gray-300);
      line-height: 1;
      font-size: 1.5em;
    }

    > button {
      background-color: var(--color-gray-900);
      appearance: none;
      border-radius: 50%;
      border: none;
      place-content: center;
      place-items: center;
      line-height: 1;
      height: 1.7em;
      width: 1.7em;
      flex-shrink: 0;
      cursor: pointer;

      &:hover {
        background-color: var(--color-gray-700);

        > .icon {
          color: var(--color-gray-300);
        }
      }

      > .icon {
        color: var(--color-gray-500);
        font-size: 1em;
        flex-shrink: 0;

        &.align {
          // Optical alignment
          margin-left: 0.125em;
        }
      }

      &.large {
        height: 3em;
        width: 3em;

        > .icon {
          font-size: 1.625em;
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

      padding: 0.5em 0.75em;
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
        width: 100%;
        text-align: center;
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
