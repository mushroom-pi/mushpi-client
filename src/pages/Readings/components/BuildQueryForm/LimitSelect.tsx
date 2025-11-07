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

export const LimitSelect = ({
  value,
  onChange,
  height,
  sx,
}: {
  value: string;
  onChange: (n: number) => void;
  height?: number;
  sx?: SxProps<Theme>;
}) => (
  <FormControl sx={{ minWidth: 140, ...sx }} size="medium">
    <InputLabel id="limit-label">Limit</InputLabel>
    <Select
      labelId="limit-label"
      value={value}
      label="Limit"
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
      {[25, 50, 100, 250, 500].map((n) => (
        <MenuItem key={n} value={String(n)}>
          {n}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
  </FormControl>
);
