import type { PicoUnit } from '~api/generated';

export interface ManualRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (unit: PicoUnit) => void;
}
