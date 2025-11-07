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

export const PicoUnitSelect = ({
  picoUnits,
  value,
  onChange,
  height,
  sx,
}: {
  picoUnits: { id: number; name?: string | null; handle?: string | null }[];
  value: string;
  onChange: (val: number) => void;
  height?: number;
  sx?: SxProps<Theme>;
}) => (
  <FormControl sx={{ minWidth: 280, ...sx }} size="medium">
    <InputLabel id="pico-unit-selector-label">Pico Unit</InputLabel>
    <Select
      labelId="pico-unit-selector-label"
      id="pico-unit-selector"
      label="Pico Unit"
      value={value}
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
      {picoUnits.map(({ id, name, handle }) => (
        <MenuItem key={id} value={String(id)}>
          {name ?? handle}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
  </FormControl>
);
