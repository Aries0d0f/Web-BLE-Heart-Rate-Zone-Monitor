export enum HeartRateFormula {
  "MHR" = "MHR",
  "HRR" = "HRR",
  "LTHR" = "LTHR",
}

export type Preference = {
  showAllDevices: boolean;
  age: number;
} & (
  | {
      enableHeartRateZone: false;
      formula?: never;
      maxHeartRate?: never;
      restingHeartRate?: never;
      lactateThresholdHeartRate?: never;
    }
  | {
      enableHeartRateZone: true;
      formula: HeartRateFormula;
      maxHeartRate?: number;
      restingHeartRate: number;
      lactateThresholdHeartRate: number;
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
};
