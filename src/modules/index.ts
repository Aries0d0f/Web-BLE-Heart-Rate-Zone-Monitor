import { useCtx } from '@/modules/utils/context/context.service';

import type { Module } from '@/modules/types';
import type { InstallContext } from '@/modules/utils/context/context.model';

const serviceModules = new Map<string, Module>();

export const initModules = () =>
  Promise.all(
    Object.entries(import.meta.glob<Module>('./**/*.service.ts')).map<Promise<[string, Module]>>(
      async ([filename, module]) => [
        filename.replace(/\.\/(.+)\/.+\.service\.ts/, `$1`),
        await module()
      ]
    )
  ).then((modules) => {
    modules.forEach(([name, module]) => serviceModules.set(name, module));
  });

function execModulesMethod(modules: string[], method: string, ...args: any[]) {
  modules
    .map((name) => serviceModules.get(name))
    .filter((module) => module?.[method])
    .forEach((module) => module![method](...args));
}

export const installModules = (ctx: InstallContext) => {
  execModulesMethod([], 'install', ctx);
};

export const setupModules = () => {
  execModulesMethod(['bluetooth', 'pwa'], 'setup', useCtx());
};
