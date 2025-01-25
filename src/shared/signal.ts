import { computed as _computed, readonly, shallowRef, triggerRef } from 'vue';

import type { ComputedGetter, ShallowRef } from 'vue';

const SIGNAL_DEBUG_INSPECTION = Symbol('SIGNAL_DEBUG_INSPECTION');

export type Signal<T> = {
  (): T;
  readonly set: (value: T) => void;
  readonly update: (updater: (value: T) => T) => void;
  readonly mutate: (mutator: (value: T) => void) => void;
  readonly [SIGNAL_DEBUG_INSPECTION]: ShallowRef<T>;
};

export const signal = <T>(initialValue: T): Signal<T> => {
  const $ref: ShallowRef<T> = shallowRef<T>(initialValue);
  const state = () => readonly($ref).value as T;

  state.set = (value: T) => {
    $ref.value = value;
  };
  state.update = (updater: (value: T) => T) => {
    $ref.value = updater($ref.value);
  };
  state.mutate = (mutator: (value: T) => void) => {
    mutator($ref.value);
    triggerRef($ref);
  };
  state[SIGNAL_DEBUG_INSPECTION] = $ref;

  return state;
};

export const computed = <T>(getter: ComputedGetter<T>): (() => T) => {
  const state = _computed(getter);

  return () => state.value;
};

export const toggleSignal = (signal: Signal<boolean>): void => signal.update((value) => !value);

export const debug = <T>(signal: Signal<T>) => {
  return signal[SIGNAL_DEBUG_INSPECTION];
};
