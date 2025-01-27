<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { refDebounced, useStorage } from "@vueuse/core";
import { TimerState, useTimer } from "@/shared/timer";

import { HeartRateFormula } from "@/model/preference.model";
import { defaultPreferences } from "@/model/preference.model";
import { signal } from "@/shared/signal";

import type { Preference } from "@/model/preference.model";
import type { TimerHooks } from "@/shared/timer";

type Zone = {
  index: number;
  id: string;
  name: string;
  min: number;
  max: number;
  timer: ReturnType<typeof useTimer>;
  active: boolean;
};

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

const chartHeightRatio = computed(() =>
  Math.max(60, ...zones.value.map((zone) => zone.timer.timestamp))
);
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

const zones = ref<Zone[]>([]);
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

const setupZones = () => {
  zones.value = heartRateZonePercent[formula.value]
    .map((zone, index, zones) => ({
      index,
      id: `zone-${index + 1}`,
      name: `Zone ${index + 1}`,
      min:
        index === 0 && preferences.value.overrideZone1
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
    }));
};

const setupUpdateSchedule = () => {
  globalThis.requestAnimationFrame(() => {
    zones.value.forEach((zone) => {
      if (isGlobalTimerInitialized()) {
        if (zone.active) {
          zone.timer[
            zone.timer.state === TimerState.INITIAL ? "start" : "resume"
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
    if (id !== preId) {
      setupUpdateSchedule();
    }
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  setupZones();
  setupHooks();
});
</script>

<template>
  <template v-if="preferences.enableHeartRateZone">
    <template
      v-if="props.heartRate && activeZone && isGlobalTimerInitialized()"
    >
      <h3 :class="$style[activeZone.id]">
        <template v-if="activeZone.timer.clock.hours !== '00'">
          {{ activeZone.timer.clock.formatted }}
        </template>
        <template v-else>
          {{ activeZone.timer.clock.formatted.substring(3, 10) }}
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
        {
          [$style.chart]: preferences.enableChart && isGlobalTimerInitialized(),
        },
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
              [$style.active]: props.heartRate && zone.active,
            },
          ]"
          :style="
            preferences.enableChart
              ? {
                  '--value': zone.timer.timestamp / chartHeightRatio || 0,
                }
              : {}
          "
        >
          <label :class="[$style.wrapper, $style.flex, $style.horizontal]">
            <Icon :class="$style.icon" icon="fa6-solid:heart" />
            <span>{{ zone.name }}</span>
          </label>
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
    --chart-view-height: clamp(2.5em, calc(100cqh - 25em), 6em);
    --compact-view-height: 1.2em;

    place-content: center;
    place-items: end;
    height: var(--compact-view-height);
    width: var(--monitor-width);
    will-change: height;
    transition: height 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);

    &.chart {

      height: var(--chart-view-height);

      > .zone {
        height: calc((var(--chart-view-height) - var(--compact-view-height)) * var(--value) + var(--compact-view-height));
      }
    }
  }

  --wrapper-gap: 0.3em;

  height: var(--compact-view-height);
  width: 1.2em;
  border-radius: 0.6em;
  font-weight: bold;
  flex-shrink: 0;
  place-content: center;
  place-items: end;
  will-change: width, height, opacity;
  transition: height 1s linear,
    width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.075),
    opacity 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);

  &.active {
    width: calc(var(--monitor-width) - (1.2em + var(--wrapper-gap)) * 4);
  }

  > label {
    --wrapper-gap: 0.3em;

    height: 1.2em;
    padding: 0.1em 0.3em;
    place-content: center;
    place-items: center;
    flex-shrink: 0;
    will-change: transform;
    transition: transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
      opacity 0.1s cubic-bezier(0.075, 0.82, 0.165, 1);
    transform-origin: center;

    > span,
    > .icon {
      flex-shrink: 0;
      white-space: nowrap;
      vertical-align: middle;
      margin-right: 0.2em;
      font-size: 0.7em;
      line-height: 1;
    }

    > span {
      margin-right: 0.2em;
      // Optical alignment
      margin-bottom: -0.1em;
    }
  }

  @each $style, $color in $style-sets {
    &.#{$style} {
      background-color: $color;
    }
  }

  &:not(.active) {
    opacity: 0.5;

    > * {
      opacity: 0;
      transform: scale(0);
    }
  }
}
</style>
