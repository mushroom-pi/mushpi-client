import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
} from '@mui/material';

const DISPLAY_POINT_OPTIONS = [25, 50, 100, 200];

export const DisplayPointsSelect = ({
  value,
  onChange,
  height,
  sx,
}: {
  value: number;
  onChange: (n: number) => void;
  height?: number;
  sx?: SxProps<Theme>;
}) => (
  <FormControl sx={{ minWidth: 140, width: { xs: '100%', xl: 'auto' }, ...sx }} size="medium">
    <InputLabel id="display-points-label">Display points</InputLabel>
    <Select
      labelId="display-points-label"
      value={String(value)}
      label="Display points"
      size="medium"
      onChange={(e: SelectChangeEvent) => onChange(Number(e.target.value))}
      sx={{
        '& .MuiSelect-select': {
          height,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      {DISPLAY_POINT_OPTIONS.map((n) => (
        <MenuItem key={n} value={String(n)}>
          {n}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
  </FormControl>
);
