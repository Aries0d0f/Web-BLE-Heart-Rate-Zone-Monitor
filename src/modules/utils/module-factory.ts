import { inject } from 'vue';

import type { InjectionKey } from 'vue';

import { useCtx } from './context/context.service';

export function createModuleSetup<T extends (...args: Params) => R, Params extends any[], R = ReturnType<T>>(
  PROVIDE_KEY: InjectionKey<R>,
  setup: (...args: Params) => R,
  fallback?: R
) {
  return (...args: Params) => {
    let provided;

    if (fallback) provided = fallback;
    else provided = setup(...args);

    const { app } = useCtx();

    if (app) {
      app.provide(PROVIDE_KEY, provided);
    } else {
      args?.[0]?.app?.provide(PROVIDE_KEY, provided);
    }

    return provided;
  };
}

export function createModuleHook<T extends (...args: Params) => R, Params extends any[], R = ReturnType<T>>(
  PROVIDE_KEY: InjectionKey<R>,
  setup: (...args: Params) => R,
  fallback?: R
) {
  return (...args: Params) => {
    let provided = inject<R>(PROVIDE_KEY);

    if (provided) return provided;

    const { app } = useCtx();

    if (fallback) provided = fallback;
    else provided = setup(...args);

    if (app) {
      app.provide(PROVIDE_KEY, provided!);
    } else {
      args?.[0]?.app?.provide(PROVIDE_KEY, provided);
    }

    return provided;
  };
}
