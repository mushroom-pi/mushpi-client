import type { Theme } from '@emotion/react';
import type { SxProps } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';

export const DateTimeField = ({
  label,
  value,
  onChange,
  helperText,
  sx,
}: {
  label: string;
  value: Dayjs | null;
  onChange: (v: Dayjs | null) => void;
  helperText?: string;
  sx?: SxProps<Theme>;
}) => (
  <DateTimePicker
    label={label}
    value={value}
    onChange={(v) => onChange(v ?? null)}
    slotProps={{
      textField: {
        size: 'medium',
        helperText: helperText ?? ' ',
        sx,
      },
    }}
  />
);
