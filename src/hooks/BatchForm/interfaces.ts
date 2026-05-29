export interface BatchFormFieldValues {
  description: string;
  species: string;
  temperatureTarget: string;
  humidityTarget: string;
  startAt: string;
  finishAt: string;
  notes: string;
}

export interface StartAtChangeOpts {
  recipeId?: string;
  recipes?: Array<{ id: number; duration_days: number }>;
}
