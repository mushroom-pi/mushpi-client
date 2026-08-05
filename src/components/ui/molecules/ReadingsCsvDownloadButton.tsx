import DownloadIcon from '@mui/icons-material/Download';
import { Button, Tooltip } from '@mui/material';

export interface ReadingsCsvDownloadButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  tooltip: string;
}

/**
 * Reusable CSV download button for readings export.
 * Used on both the Readings page (pico unit readings) and the Batch detail page (batch readings).
 */
export const ReadingsCsvDownloadButton: React.FC<ReadingsCsvDownloadButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  tooltip,
}) => (
  <Tooltip title={tooltip}>
    <span>
      <Button
        variant="contained"
        onClick={onClick}
        disabled={disabled || isLoading}
        startIcon={<DownloadIcon />}
        aria-label="download"
        size="medium"
        color="secondary"
        sx={{
          minHeight: 48,
          paddingLeft: 2,
          paddingRight: 2,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {isLoading ? 'Fetching...' : 'CSV'}
      </Button>
    </span>
  </Tooltip>
);
