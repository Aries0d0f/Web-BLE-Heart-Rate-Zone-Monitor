<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useStorage } from "@vueuse/core";

import {
  HeartRateFormula,
  TriggerModeOnTimerConnect,
  TriggerModeOnTimerDisconnect,
  defaultPreferences,
} from "@/model/preference.model";

import type { Preference } from "@/model/preference.model";

const emits = defineEmits<{
  (e: "close"): void;
}>();

const preferences = useStorage<Preference>("preferences", defaultPreferences);

const HRmax = computed(() =>
  preferences.value.age ? Math.round(206.9 - 0.67 * preferences.value.age) : 0
);

const onAgeInputBlur = () => {
  if (!preferences.value.age || preferences.value.age < 1) {
    preferences.value.age = defaultPreferences.age;
  }
};

const onRestingHeartRateInputBlur = () => {
  if (
    !preferences.value.restingHeartRate ||
    preferences.value.restingHeartRate < 60
  ) {
    preferences.value.restingHeartRate = defaultPreferences.restingHeartRate;
  }
};

const onLactateThresholdHeartRateInputBlur = () => {
  if (
    !preferences.value.lactateThresholdHeartRate ||
    preferences.value.lactateThresholdHeartRate < 60
  ) {
    preferences.value.lactateThresholdHeartRate =
      defaultPreferences.lactateThresholdHeartRate;
  }
};

const resetPreferenceHandler = () => {
  preferences.value = defaultPreferences;
  window.location.reload();
};
</script>

<template>
  <div
    :class="[
      $style['dialog-container'],
      $style.wrapper,
      $style.flex,
      $style.vertical,
    ]"
  >
    <header :class="[$style.wrapper, $style.flex, $style.horizontal]">
      <h1>Preference</h1>
      <button @click="emits('close')"><Icon icon="fa6-solid:xmark" /></button>
    </header>
    <div
      :class="[
        $style['dialog-wrapper'],
        $style.wrapper,
        $style.flex,
        $style.vertical,
      ]"
    >
      <div
        :class="[$style.field, $style.wrapper, $style.flex, $style.horizontal]"
      >
        <label :class="[$style.wrapper, $style.flex, $style.vertical]">
          <span>Show All Bluetooth Devices (even if unsupported)</span>
          <i>*Notice: This may cause unexpected behavior</i>
        </label>
        <input type="checkbox" v-model="preferences.showAllDevices" />
      </div>
      <div
        :class="[$style.field, $style.wrapper, $style.flex, $style.horizontal]"
      >
        <label :class="[$style.wrapper, $style.flex, $style.vertical]">
          <span>Timer Behavior on Connect</span>
          <span>Timer behavior when Bluetooth device connect</span>
        </label>
        <div
          :class="[
            $style['option-wrapper'],
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <template
            v-for="[name, mode] in Object.entries(TriggerModeOnTimerConnect)"
          >
            <div
              @click="() => (preferences.autoTriggerTimerOnConnect = mode)"
              :class="[
                $style.option,
                $style.wrapper,
                $style.flex,
                $style.vertical,
                {
                  [$style.active]:
                    preferences.autoTriggerTimerOnConnect === mode,
                },
              ]"
            >
              <label>{{ name }}</label>
            </div>
          </template>
        </div>
      </div>
      <div
        :class="[$style.field, $style.wrapper, $style.flex, $style.horizontal]"
      >
        <label :class="[$style.wrapper, $style.flex, $style.vertical]">
          <span>Timer Behavior on Disconnect</span>
          <span>Timer behavior when Bluetooth device disconnect</span>
        </label>
        <div
          :class="[
            $style['option-wrapper'],
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <template
            v-for="[name, mode] in Object.entries(TriggerModeOnTimerDisconnect)"
          >
            <div
              @click="() => (preferences.autoTriggerTimerOnDisconnect = mode)"
              :class="[
                $style.option,
                $style.wrapper,
                $style.flex,
                $style.vertical,
                {
                  [$style.active]:
                    preferences.autoTriggerTimerOnDisconnect === mode,
                },
              ]"
            >
              <label>{{ name }}</label>
            </div>
          </template>
        </div>
      </div>
      <div
        :class="[$style.field, $style.wrapper, $style.flex, $style.horizontal]"
      >
        <label :class="[$style.wrapper, $style.flex, $style.vertical]">
          <span>Heart Rate Zone</span>
        </label>
        <input type="checkbox" v-model="preferences.enableHeartRateZone" />
      </div>
      <template v-if="preferences.enableHeartRateZone">
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Age</span>
          </label>
          <input
            @blur="onAgeInputBlur"
            v-model="preferences.age"
            type="number"
            inputmode="numeric"
            min="1"
            max="200"
            required
          />
        </div>
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Formula</span>
            <span>Formula for calculate heart rate zones</span>
          </label>
          <div
            :class="[
              $style['option-wrapper'],
              $style.wrapper,
              $style.flex,
              $style.horizontal,
            ]"
          >
            <template
              v-for="[name, formula] in Object.entries(HeartRateFormula)"
            >
              <div
                @click="() => (preferences.formula = formula)"
                :class="[
                  $style.option,
                  $style.wrapper,
                  $style.flex,
                  $style.vertical,
                  {
                    [$style.active]: preferences.formula === formula,
                  },
                ]"
              >
                <label>{{ name }}</label>
              </div>
            </template>
          </div>
        </div>
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Max Heart Rate</span>
            <template
              v-if="
                !preferences.maxHeartRate || HRmax === preferences.maxHeartRate
              "
            >
              <span>HRmax = Round(206.9 – (0.67 x age))</span>
            </template>
            <template v-else>
              <i>Custom Value</i>
            </template>
          </label>
          <input
            v-model="preferences.maxHeartRate"
            :placeholder="String(HRmax)"
            type="number"
            inputmode="numeric"
            min="60"
            max="290"
          />
        </div>
        <template v-if="preferences.formula !== HeartRateFormula.MHR">
          <div
            :class="[
              $style.field,
              $style.wrapper,
              $style.flex,
              $style.horizontal,
            ]"
          >
            <label :class="[$style.wrapper, $style.flex, $style.vertical]">
              <span>Resting Heart Rate</span>
            </label>
            <input
              v-model="preferences.restingHeartRate"
              @blur="onRestingHeartRateInputBlur"
              type="number"
              inputmode="numeric"
              min="60"
              max="150"
            />
          </div>
        </template>
        <template v-if="preferences.formula === HeartRateFormula.LTHR">
          <div
            :class="[
              $style.field,
              $style.wrapper,
              $style.flex,
              $style.horizontal,
            ]"
          >
            <label :class="[$style.wrapper, $style.flex, $style.vertical]">
              <span>Lactate Threshold Heart Rate</span>
            </label>
            <input
              v-model="preferences.lactateThresholdHeartRate"
              @blur="onLactateThresholdHeartRateInputBlur"
              type="number"
              inputmode="numeric"
              min="60"
              max="290"
            />
          </div>
        </template>
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Enable Chart</span>
            <span> Show heart rate zone chart on the main screen </span>
          </label>
          <input type="checkbox" v-model="preferences.enableChart" />
        </div>
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Zone 1 Override</span>
            <span>
              Count as Zone 1 when your heart rate is below the Zone 1
              threshold.
            </span>
          </label>
          <input type="checkbox" v-model="preferences.overrideZone1" />
        </div>
        <div
          :class="[
            $style.field,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
          ]"
        >
          <label :class="[$style.wrapper, $style.flex, $style.vertical]">
            <span>Reset Preferences</span>
            <span>
              <i>*Notice: This action cannot be undo.</i><br />
              Reset all preferences to default values then reload.
            </span>
          </label>
          <button
            @click="resetPreferenceHandler"
            :class="[$style.wrapper, $style.flex, $style.horizontal, $style.danger]"
          >
            <Icon icon="fa6-solid:rotate" />
            <span>Reset</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

.dialog {
  &-container {
    --wrapper-gap: 3em;
    --dialog-border-radius: 2em;

    padding: 2em;
    border: 1px solid var(--color-gray-500);
    border-radius: var(--dialog-border-radius);
    background-color: var(--color-gray-900);
    width: fit-content;
    height: fit-content;
    max-width: 90vw;
    overflow: hidden;

    @media screen and (((max-width: 640px) and (max-height: 900px)) or (max-width: 480px) or (max-height: 768px)) {
      --wrapper-gap: 1.5em;
      --dialog-border-radius: 1.5em;

      width: 100cqw;
      max-width: 100cqw;
      min-height: 100cqh;
      border: none;
      border-radius: 0;
      overflow-y: scroll;
      padding: 1em;
    }

    button {
      appearance: none;
      background-color: transparent;
      border: none;
      color: var(--color-gray-500);
      font-size: 1.5em;
      cursor: pointer;
    }

    > header {
      --wrapper-gap: 5em;

      place-items: center;
      place-content: space-between;
      position: sticky !important;
      top: -1em;
      background-color: inherit;
      z-index: 1;
      margin: -1em;
      padding: 1em;
      margin-bottom: 0;
      padding-bottom: 1em;

      h1 {
        color: var(--color-gray-500);
        margin: 0;
      }
    }
  }

  &-wrapper {
    --wrapper-gap: 2em;

    .field {
      --wrapper-gap: 4em;

      @media screen and (max-width: 480px) {
        --wrapper-gap: 2em;
      }

      width: 100%;
      place-content: space-between;
      place-items: center;

      > label {
        --wrapper-gap: 0.2em;

        color: var(--color-gray-600);
        font-size: 1em;

        :last-child:not(:only-child) {
          font-size: 80%;
        }
      }

      > input {
        position: relative;
        appearance: none;
        background-color: var(--color-gray-800);
        border: 1px solid var(--color-gray-500);
        border-radius: 0.5em;
        padding: 0.5em;
        width: 5em;
        height: 2em;
        outline: none;
        flex-shrink: 0;
        cursor: pointer;

        &,
        &::placeholder {
          color: var(--color-gray-500);
          font-size: 1em;
        }

        &[type="checkbox"] {
          display: inline-flex;
          place-items: center;
          width: 3em;
          height: 1.5em;
          border-radius: 1em;
          padding: 0.125em;

          &::before {
            content: "";
            display: block;
            position: absolute;
            background-color: var(--color-gray-600);
            border-radius: 1em;
            width: 1em;
            height: 1em;
            transition: background-color 0.2s ease-in-out;
          }

          &:checked {
            border-color: var(--color-primary-100);
            background-color: var(--color-primary);
            transition: background-color 0.1s ease-in-out;

            &::before {
              background-color: var(--color-gray-100);
              left: auto;
              right: 0.125em;
            }
          }
        }
      }

      > button {
        --wrapper-gap: 0.75em;

        background-color: var(--color-gray-800);
        color: var(--color-gray-500);
        place-content: center;
        place-items: center;
        border-radius: 0.5em;
        padding: 0.5em 1em;
        font-size: 1em;

        &:hover {
          background-color: var(--color-gray-700);
        }

        &.danger {
          color: var(--color-red-500);
        }
      }

      @media screen and (max-width: 640px) {
        &:has(> .option-wrapper) {
          --wrapper-gap: 1em;

          place-content: center;
          place-items: start;
          flex-direction: column;
        }
      }

      .option {
        &-wrapper {
          --wrapper-gap: 0;

          height: 2em;
          place-items: center;
          border: 1px solid var(--color-gray-500);
          border-radius: 0.5em;
          flex-shrink: 0;
          overflow: hidden;

          @media screen and (max-width: 640px) {
            width: 100%;
          }
        }

        width: 100%;
        height: 100%;
        min-width: 5em;
        place-content: center;
        place-items: center;
        color: var(--color-gray-500);
        cursor: pointer;

        &.active {
          background-color: var(--color-primary);
          color: var(--color-primary-100);
        }

        label {
          font-size: 1em;
          line-height: 1;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
