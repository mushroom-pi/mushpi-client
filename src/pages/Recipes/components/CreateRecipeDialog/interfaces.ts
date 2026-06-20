export type {
  RecipeFormErrors,
  RecipeFormTouched,
  RecipeFormValues,
} from '~hook/RecipeForm/interfaces';

export interface CreateRecipeDialogProps {
  open: boolean;
  onClose: () => void;
}
