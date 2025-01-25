import type { App } from 'vue';

export type Context = {
  app?: App<Element>;
};

export type InstallContext = {
  app: App<Element>;
};
