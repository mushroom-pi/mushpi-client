export type RecipeFormValues = {
  name: string;
  species: string;
  temperature_target: string;
  humidity_target: string;
  duration_days: string;
  notes: string;
};

export type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>;
export type RecipeFormTouched = Partial<Record<keyof RecipeFormValues, boolean>>;
