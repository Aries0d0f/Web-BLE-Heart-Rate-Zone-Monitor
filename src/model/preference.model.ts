export enum HeartRateFormula {
  "MHR" = "MHR",
  "HRR" = "HRR",
  "LTHR" = "LTHR",
}

export enum TriggerModeOnTimerConnect {
  NONE = 'None',
  START = 'Start',
  RESTART = 'Restart',
}

export enum TriggerModeOnTimerDisconnect {
  NONE = 'None',
  PAUSE = 'Pause',
  STOP = 'Stop',
}

export type Preference = {
  showAllDevices: boolean;
  age: number;
  autoTriggerTimerOnConnect: TriggerModeOnTimerConnect;
  autoTriggerTimerOnDisconnect: TriggerModeOnTimerDisconnect;
} & (
  | {
      enableHeartRateZone: false;
      formula?: never;
      maxHeartRate?: never;
      restingHeartRate?: never;
      lactateThresholdHeartRate?: never;
      overrideZone1?: never;
      enableChart?: never;
    }
  | {
      enableHeartRateZone: true;
      formula: HeartRateFormula;
      maxHeartRate?: number;
      restingHeartRate: number;
      lactateThresholdHeartRate: number;
      overrideZone1: boolean;
      enableChart: boolean;
    }
);

export const defaultPreferences: Preference = {
  showAllDevices: false,
  enableHeartRateZone: true,
  formula: HeartRateFormula.MHR,
  age: 25,
  maxHeartRate: undefined,
  restingHeartRate: 60,
  lactateThresholdHeartRate: 150,
  overrideZone1: false,
  autoTriggerTimerOnConnect: TriggerModeOnTimerConnect.NONE,
  autoTriggerTimerOnDisconnect: TriggerModeOnTimerDisconnect.PAUSE,
  enableChart: true,
};
