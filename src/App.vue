<script setup lang="ts">
import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
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

const buildVersion = computed(() => GIT_COMMIT_HASH);
const appVersion = computed(
  () => `v${__APP_VERSION__} (${buildVersion.value.slice(0, 7)})`
);

const timer = useTimer(timerHooks);
const { device, status, onPair, onForget } = useBluetooth();

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
  <div
    :class="[
      $style['viewport-entry'],
      $style.wrapper,
      $style.flex,
      $style.vertical,
    ]"
  >
    <div
      :class="[
        $style['viewport-topbar'],
        $style.wrapper,
        $style.flex,
        $style.horizontal,
        {
          [$style.chart]: preferences.enableChart && timer.state.value !== TimerState.INITIAL,
        }
      ]"
    >
      <div
        :class="[
          $style.badge,
          $style.wrapper,
          $style.flex,
          $style.horizontal,
          {
            [$style.active]: device,
          },
        ]"
      >
        <Icon
          :class="$style.icon"
          :icon="device ? 'fa6-brands:bluetooth-b' : 'mdi:bluetooth-off'"
        />
        <template v-if="device?.name">
          <p>{{ device?.name }}</p>
        </template>
      </div>
    </div>
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
              No Bluetooth available on this platform. Check if it is disabled
              on the system.
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
    </main>
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
        <Icon :class="$style.icon" icon="fa-brands:github" />
      </a>
      <p>
        <a
          :href="`https://github.com/Aries0d0f/Web-BLE-Heart-Rate-Zone-Monitor/tree/${buildVersion}`"
          :class="$style.clear"
          title="View on GitHub"
          target="_blank"
          rel="noopener"
          aria-label="View on GitHub"
        >
          {{ appVersion }}
        </a>
      </p>
    </footer>
  </div>
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
  &-entry {
    --wrapper-gap: 0;
    --monitor-width: 10em;

    background-color: var(--color-black);
    min-height: 100%;
    width: 100%;
    place-items: center;
    font-size: 32px;
    will-change: font-size;
    transition: font-size 0.5s ease-in-out;
    overflow: hidden scroll;
    container: viewport / size;

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
      --wrapper-gap: 0.5em;

      padding: 1em 0;
      text-align: center;
      font-size: 0.75em;
      color: var(--color-gray-800);

      p {
        font-size: 0.5em;
        margin: 0;

        &:hover {
          color: var(--color-gray-700);
        }
      }

      a {
        font-size: 1em;
        white-space: nowrap;
        color: var(--color-gray-700);

        &:not(:hover) {
          text-decoration: none;
        }

        &:hover {
          color: var(--color-gray-500);
        }

        > .icon {
          display: block;
          margin: auto;
        }
      }
    }
  }

  &-container {
    --wrapper-gap: 1em;

    height: fit-content;
    width: fit-content;
    min-height: 100cqh;
    place-content: center;
    place-items: center;
    flex-shrink: 0;
    padding: 1em 0;
  }

  &-wrapper {
    --wrapper-gap: 2em;
  }

  &-topbar {
    --wrapper-gap: 1em;

    width: var(--monitor-width);
    place-content: center;
    place-items: center;
    margin: 1em;
    margin-bottom: -1em;
    will-change: margin;
    transition: margin-top 0.1s linear 0s, margin-bottom 0.1s ease-in 0.11s;
    
    &.chart {
      transition: margin-top 0.1s linear 0.1s, margin-bottom 0.1s ease-out 0s;

      @media screen and (min-height: 720px) {
        margin-top: clamp(2em, calc(100cqh - 6em - 22.5em), 4em);
        margin-bottom: 0;
      }
    }

    > button {
      cursor: pointer;

      &:not(.active) {
        display: none !important;
      }
    }

    .badge {
      --wrapper-gap: 0.4em;

      appearance: none;
      padding: 0.25em 0.375em;
      border: none;
      border-radius: 1em;
      background-color: var(--color-gray-900);
      color: var(--color-gray-500);
      place-content: center;
      place-items: center;
      min-width: 1em;
      height: 1em;
      font-size: 0.875em;

      &:not(.active) {
        opacity: 0.3;
      }

      &:not(:has(p)) {
        padding: 0.25em;
      }

      > p,
      > .icon {
        font-size: 0.5em;
        flex-shrink: 0;
        line-height: 1;
      }

      p {
        white-space: nowrap;
        max-width: calc(var(--monitor-width) * 1.2);
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 0.25em;
        margin: 0;
      }
    }
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
    overflow: scroll;
    zoom: 1;

    &:has(*) {
      backdrop-filter: blur(6px);
      pointer-events: initial;
    }

    > * {
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
