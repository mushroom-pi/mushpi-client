export interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  defaultValues?: {
    picoUnitId?: number;
    recipeId?: number;
    description?: string;
    species?: string;
    temperatureTarget?: number;
    humidityTarget?: number;
  };
}
