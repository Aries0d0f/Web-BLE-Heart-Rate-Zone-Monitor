/// <reference types="vite-plugin-pwa/vue" />

import { watch } from "vue";
import { useOnline } from "@vueuse/core";

import type { InjectionKey } from "vue";

import { createModuleSetup } from "@/modules/utils/module-factory";

import type { Context } from "@/modules/utils/context/context.model";

const PROVIDE_KEY: InjectionKey<void> = Symbol.for("PwaRegister");

const $useRegisterSW = async (_ctx: Context) => {
  const { useRegisterSW } = await import("virtual:pwa-register/vue");

  const online = useOnline();

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(swScriptUrl, registration) {
      if (!registration) return;

      registration.onupdatefound = () => {
        console.info("Found service worker update.");
      };

      if (registration.installing) {
        console.info("Service worker update is available. Installing...");
      }

      registration
        .update()
        .then(() => {
          if (registration.installing) {
            console.info("Service worker update is available. Installing...");
          }

          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch(async (error) => {
          if (!online.value) {
            console.info("network disconnected.");
            console.info(
              "Service worker update failed, but will be retried when online."
            );
            return;
          }

          console.error(
            `[${swScriptUrl}], Service worker update failed:`,
            error
          );
        });
    },
    onRegisterError(error) {
      console.info(
        "Service worker registration failed.\nAdvanced Caches, Offline Mode and Smart Loader will not work:\n\n",
        error
      );
    },
  });

  watch(needRefresh, (value) => {
    if (value) {
      console.info("Service worker update is installed. Reloading...");
      updateServiceWorker();
    }
  });
};

export const setup = createModuleSetup(PROVIDE_KEY, $useRegisterSW);
