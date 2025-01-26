<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";

import { setupModules } from "@/modules";
import { useBluetooth } from "./modules/bluetooth/bluetooth.service";
import { signal } from "@/shared/signal";
import { TimerState, useTimer } from "@/shared/timer";

import Controller from "@/components/Controller.vue";
import Monitor from "@/components/Monitor.vue";
import Preference from "@/components/Preference.vue";
import HeartRateZone from "@/components/HeartRateZone.vue";
import { BluetoothStatus, Features } from "@/modules/bluetooth/bluetooth.model";
import {
  TriggerModeOnTimerConnect,
  TriggerModeOnTimerDisconnect,
  defaultPreferences,
} from "@/model/preference.model";

import type { Feature } from "@/modules/bluetooth/bluetooth.model";
import type { TimerHooks } from "@/shared/timer";
import type { Preference as PreferenceType } from "@/model/preference.model";

setupModules();

const preferences = useStorage<PreferenceType>(
  "preferences",
  defaultPreferences
);

const meters = ref<Map<Feature, number>>(new Map());
const timerHooks = ref<TimerHooks>();
const timer = useTimer(timerHooks);
const { status, onPair, onForget } = useBluetooth();

const onShowPreference = signal(false);

const setupTimerHooksHandler = (hooks: TimerHooks) => {
  timerHooks.value = hooks;
};

onPair(() => {
  switch (preferences.value.autoTriggerTimerOnConnect) {
    case TriggerModeOnTimerConnect.START:
      if (timer.state.value === TimerState.INITIAL) {
        timer.start();
      } else if (!timer.isActive.value) {
        timer.resume();
      }
      break;
    case TriggerModeOnTimerConnect.RESTART:
      timer.start();
      break;
  }
});

onForget(() => {
  switch (preferences.value.autoTriggerTimerOnDisconnect) {
    case TriggerModeOnTimerDisconnect.STOP:
      timer.stop();
      break;
    case TriggerModeOnTimerDisconnect.PAUSE:
      timer.pause();
      break;
  }
});
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
    <template v-if="status !== BluetoothStatus.NORMAL">
      <div
        :class="[
          $style['viewport-banner'],
          $style.wrapper,
          $style.flex,
          $style.horizontal,
          {
            [$style.warn]: status === BluetoothStatus.UNAUTHORIZED,
            [$style.error]:
              status === BluetoothStatus.UNSUPPORTED ||
              status === BluetoothStatus.DISABLED,
          },
        ]"
      >
        <template v-if="status === BluetoothStatus.UNKNOWN">
          <Icon :class="$style.icon" icon="fa6-solid:gear" />
          <p>Checking Bluetooth availability...</p>
        </template>
        <template v-else-if="status === BluetoothStatus.UNAUTHORIZED">
          <Icon :class="$style.icon" icon="fa6-solid:triangle-exclamation" />
          <p>Bluetooth permission is required for this app.</p>
        </template>
        <template v-else-if="status === BluetoothStatus.DISABLED">
          <Icon :class="$style.icon" icon="fa6-solid:circle-xmark" />
          <p>
            No Bluetooth available on this platform. Check if it is disabled on
            the system.
          </p>
        </template>
        <template v-else>
          <Icon :class="$style.icon" icon="fa6-solid:circle-xmark" />
          <p>
            Your browser does not support
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API"
            >
              Web Bluetooth API
            </a>
            which is necessary for this app.
          </p>
        </template>
      </div>
    </template>
    <template v-else>
      <HeartRateZone
        :heart-rate="meters.get(Features.HEART_RATE.ID)"
        @setup-hooks="setupTimerHooksHandler"
      />
    </template>
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
    <footer :class="[$style.wrapper, $style.flex, $style.vertical]">
      <p>
        This work is licensed under
        <a
          href="https://github.com/Aries0d0f/Web-BLE-Heart-Rate-Zone-Monitor/blob/main/LICENSE"
          target="_blank"
          rel="noopener"
          >MIT-MIT License</a
        >
        by
        <a href="https://aries0d0f.me" target="_blank" rel="noopener"
          >Aries Cs (@aries0d0f)</a
        >
      </p>
      <a
        href="https://github.com/Aries0d0f/Web-BLE-Heart-Rate-Zone-Monitor"
        title="View on GitHub"
        target="_blank"
        rel="noopener"
        aria-label="View on GitHub"
      >
        <Icon icon="fa-brands:github" />
      </a>
    </footer>
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
    min-height: 100%;
    width: 100%;
    padding: 1em 0;
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

    footer {
      --wrapper-gap: 0.125em;

      text-align: center;
      font-size: 0.75em;
      color: var(--color-gray-800);

      p {
        font-size: 0.5em;

        &:hover {
          color: var(--color-gray-700);
        }
      }

      a {
        font-size: 1em;
        white-space: nowrap;
        color: var(--color-gray-700);

        &:hover {
          color: var(--color-gray-500);
        }
      }
    }
  }

  &-wrapper {
    --wrapper-gap: 2em;
  }

  &-banner {
    --wrapper-gap: 0.5em;

    width: var(--monitor-width);
    padding: 0.5em;
    border-radius: 0.5em;
    background-color: var(--color-gray-900);
    color: var(--color-gray-500);
    place-content: center;
    place-items: center;

    &.error {
      background-color: var(--color-red-500);
      color: var(--color-gray-100);
    }

    &.warn {
      background-color: var(--color-orange-500);
      color: var(--color-gray-100);
    }

    > .icon {
      flex-shrink: 0;
    }

    > p {
      margin: 0;
      font-size: 0.5em;
    }

    a {
      color: inherit;
      font-weight: bold;
      text-decoration: none;
    }
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
        pointer-events: none;
        z-index: -10;
      }
    }
  }
}
</style>
