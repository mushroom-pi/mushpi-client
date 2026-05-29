export interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    picoUnitId?: number;
    recipeId?: number;
    description?: string;
    species?: string;
    temperatureTarget?: number;
    humidityTarget?: number;
  };
}
