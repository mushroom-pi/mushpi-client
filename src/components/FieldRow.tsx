import { ListItem, ListItemText, Typography } from '@mui/material';

export function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <ListItem disableGutters>
      <ListItemText
        primary={<Typography variant="subtitle2">{label}</Typography>}
        secondary={
          <Typography variant="body2" color="text.secondary">
            {value ?? '—'}
          </Typography>
        }
      />
    </ListItem>
  );
}
