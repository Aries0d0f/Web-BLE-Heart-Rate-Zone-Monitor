import { getCurrentInstance } from 'vue';

import type { Context } from './context.model';

export const useCtx = (): Context => {
  const instance = getCurrentInstance();

  return {
    app: instance?.appContext?.app
  };
};
