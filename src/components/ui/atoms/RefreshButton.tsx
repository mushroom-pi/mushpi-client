import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Tooltip } from '@mui/material';

export type RefreshButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
  tooltip?: string;
  ariaLabel?: string;
  size?: 'small' | 'medium' | 'large';
};

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isLoading,
  tooltip = 'Refresh',
  ariaLabel = 'refresh',
  size = 'small',
}) => (
  <Tooltip title={tooltip}>
    <span>
      <IconButton onClick={onClick} disabled={isLoading} aria-label={ariaLabel} size={size}>
        <RefreshIcon />
      </IconButton>
    </span>
  </Tooltip>
);
