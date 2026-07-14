import type { PicoUnit } from '~api/generated';

export interface ReconnectPicoDialogProps {
  pico: PicoUnit | null;
  onClose: () => void;
}
