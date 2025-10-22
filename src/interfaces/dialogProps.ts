export interface DialogProps {
  open: boolean;
  onClose: () => void;
  closeOnSave?: boolean;
}
