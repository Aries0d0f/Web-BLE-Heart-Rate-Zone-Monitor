<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import { refDebounced, useStorage } from "@vueuse/core";
import { TimerState, useTimer } from "@/shared/timer";

import { HeartRateFormula } from "@/model/preference.model";
import { defaultPreferences } from "@/model/preference.model";
import { signal } from "@/shared/signal";

import type { Preference } from "@/model/preference.model";
import type { TimerHooks } from "@/shared/timer";

const heartRateZoneFormula = {
  [HeartRateFormula.MHR]: (percent: number, HRmax: number, ..._: number[]) =>
    HRmax * percent,
  [HeartRateFormula.HRR]: (
    percent: number,
    HRmax: number,
    HRrest: number,
    ..._: number[]
  ) => HRrest + percent * (HRmax - HRrest),
  [HeartRateFormula.LTHR]: (
    percent: number,
    _HRmax: number,
    _HRrest: number,
    LTHR: number
  ) => percent * LTHR,
};

const heartRateZonePercent = {
  [HeartRateFormula.MHR]: [0.5, 0.6, 0.7, 0.8, 0.9],
  [HeartRateFormula.HRR]: [0.5, 0.6, 0.7, 0.8, 0.9],
  [HeartRateFormula.LTHR]: [0.0, 0.81, 0.9, 0.94, 1.0],
};

const props = defineProps<{
  heartRate?: number;
}>();

const emits = defineEmits<{
  (e: "setup-hooks", hooks: TimerHooks): void;
}>();

const preferences = useStorage<Preference>("preferences", defaultPreferences);

const isGlobalTimerInitialized = signal(false);

const HR = computed(() => props.heartRate || 0);
const HRdebounced = refDebounced(HR, 1000);
const HRmax = computed(
  () =>
    preferences.value.maxHeartRate ||
    (preferences.value.age
      ? Math.round(206.9 - 0.67 * preferences.value.age)
      : 0)
);
const HRrest = computed(
  () =>
    preferences.value.restingHeartRate || defaultPreferences.restingHeartRate!
);
const LTHR = computed(
  () =>
    preferences.value.lactateThresholdHeartRate ||
    defaultPreferences.lactateThresholdHeartRate!
);
const formula = computed(
  () => preferences.value.formula || defaultPreferences.formula!
);

const zones = computed(() =>
  heartRateZonePercent[formula.value]
    .map((zone, index, zones) => ({
      index,
      id: `zone-${index + 1}`,
      name: `Zone ${index + 1}`,
      min:
        index === 0
          ? 0
          : heartRateZoneFormula[formula.value](
              zone,
              HRmax.value,
              HRrest.value,
              LTHR.value
            ),
      max:
        index === zones.length - 1
          ? Infinity
          : heartRateZoneFormula[formula.value](
              zones[index + 1],
              HRmax.value,
              HRrest.value,
              LTHR.value
            ),
      timer: useTimer(),
    }))
    .map((zone) => ({
      ...zone,
      get active() {
        return HRdebounced.value >= zone.min && HRdebounced.value < zone.max;
      },
    }))
);
const activeZone = computed(() => zones.value.find((zone) => zone.active));

const setupHooks = () => {
  emits("setup-hooks", {
    onStart: () => {
      isGlobalTimerInitialized.set(true);
      activeZone.value?.timer.start();
    },
    onStop: () => {
      zones.value.forEach((zone) => zone.timer.stop());
      isGlobalTimerInitialized.set(false);
    },
    onPause: () => {
      activeZone.value?.timer.pause();
    },
    onResume: () => {
      activeZone.value?.timer.resume();
    },
  });
};

const setupUpdateSchedule = () => {
  globalThis.requestAnimationFrame(() => {
    zones.value.forEach((zone) => {
      if (isGlobalTimerInitialized()) {
        if (zone.active) {
          zone.timer[
            zone.timer.state.value === TimerState.INITIAL ? "start" : "resume"
          ]();
        } else {
          zone.timer.pause();
        }
      }
    });
  });
};

watch(
  () => activeZone.value?.id,
  (id, preId) => {
    console.log("activeZone", id, preId);
    if (id !== preId) {
      setupUpdateSchedule();
    }
  },
  {
    immediate: true
  }
);

onMounted(() => {
  setupHooks();
});
</script>

<template>
  <template v-if="preferences.enableHeartRateZone">
    <template
      v-if="props.heartRate && activeZone && isGlobalTimerInitialized()"
    >
      <h3 :class="$style[activeZone.id]">
        <template v-if="activeZone.timer.clock.value.hours !== '00'">
          {{ activeZone.timer.clock.value.formatted }}
        </template>
        <template v-else>
          {{ activeZone.timer.clock.value.formatted.substring(3, 10) }}
        </template>
      </h3>
    </template>
    <template v-else>
      <h3>--:--</h3>
    </template>
    <div
      :class="[
        $style['zone-container'],
        $style.wrapper,
        $style.flex,
        $style.horizontal,
      ]"
    >
      <template v-for="zone in zones" :key="zone.id">
        <div
          :class="[
            $style.zone,
            $style.wrapper,
            $style.flex,
            $style.horizontal,
            $style[zone.id],
            {
              [$style.active]:
                props.heartRate && zone.active && isGlobalTimerInitialized(),
            },
          ]"
        >
          <Icon :class="$style.icon" icon="fa6-solid:heart" />
          <label>{{ zone.name }}</label>
        </div>
      </template>
    </div>
  </template>
</template>

<style module scoped lang="scss">
@use "@/assets/styles/modules/wrapper.module" as wrapper;

$style-sets: (
  "zone-1": (
    var(--color-blue),
  ),
  "zone-2": (
    var(--color-cyan),
  ),
  "zone-3": (
    var(--color-green),
  ),
  "zone-4": (
    var(--color-orange),
  ),
  "zone-5": (
    var(--color-red),
  ),
);

h3 {
  color: var(--color-gray-800);
  margin: 0;
  font-weight: bold;
  font-size: 1.2em;

  @each $style, $color in $style-sets {
    &.#{$style} {
      color: $color;
    }
  }
}

.zone {
  &-container {
    --wrapper-gap: 0.2em;
  }

  --wrapper-gap: 0.3em;

  padding: 0.1em 0.3em;
  height: 1.2em;
  min-width: 1.2em;
  width: fit-content;
  place-content: center;
  place-items: center;

  > .icon,
  > label {
    font-size: 0.7em;
    line-height: 1;
    vertical-align: middle;
  }

  > label {
    margin-right: 0.2em;
  }

  @each $style, $color in $style-sets {
    &.#{$style} {
      background-color: $color;
      border-radius: 1em;
      font-weight: bold;
    }
  }

  &:not(.active) {
    opacity: 0.5;

    > * {
      display: none;
    }
  }
}
</style>
