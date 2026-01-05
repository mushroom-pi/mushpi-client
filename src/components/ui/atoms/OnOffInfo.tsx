import { Chip, Stack, Switch } from '@mui/material';

import { InfoField } from './InfoField';

interface OnOffInputProps {
  label: string;
  value: boolean;
}

export const OnOffInfo: React.FC<OnOffInputProps> = ({ label, value }) => (
  <InfoField label={label} display="beside">
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Chip label="Off" color={value ? 'default' : 'info'} size="small" />
      <Switch checked={value} name={label.toLowerCase()} disabled={true} size="medium" />
      <Chip label="On" color={value ? 'info' : 'default'} size="small" />
    </Stack>
  </InfoField>
);
