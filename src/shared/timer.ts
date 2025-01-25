import { computed, ref, toValue, type MaybeRef } from "vue";
import { useIntervalFn } from "@vueuse/core";

export type Timer = ReturnType<typeof useTimer>;

export type TimerHooks = {
  onPause: () => void,
  onResume: () => void,
  onStart: () => void,
  onStop: () => void
}

export enum TimerState {
  RUNNING = "running",
  PAUSED = "paused",
  INITIAL = "initial",
}

export const useTimer = (hooks?: MaybeRef<TimerHooks | undefined>) => {
  const timestamp = ref(0);
  const controller = useIntervalFn(
    () => {
      timestamp.value += 1;
    },
    1000,
    { immediate: false, immediateCallback: false }
  );

  const $hooks = computed(() => toValue(hooks));
  const clock = computed(() => {
    const hours = Math.floor(timestamp.value / 3600);
    const minutes = Math.floor((timestamp.value % 3600) / 60);
    const seconds = timestamp.value % 60;

    const result = {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };

    return {
      ...result,
      formatted: `${result.hours}:${result.minutes}:${result.seconds}`,
    };
  });
  const state = computed<TimerState>(() =>
    controller.isActive.value
      ? TimerState.RUNNING
      : timestamp.value
      ? TimerState.PAUSED
      : TimerState.INITIAL
  );

  return {
    state,
    clock,
    timestamp,
    isActive: controller.isActive,
    resume: () => {
      $hooks.value?.onResume();
      controller.resume();
    },
    pause: () => {
      $hooks.value?.onPause();
      controller.pause();
    },
    start: () => {
      timestamp.value = 0;
      controller.resume();
      $hooks.value?.onStart();
    },
    stop: () => {
      $hooks.value?.onStop();
      controller.pause();
      timestamp.value = 0;
    },
  };
};
