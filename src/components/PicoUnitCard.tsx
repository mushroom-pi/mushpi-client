import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';

import type { PicoUnit } from '../api/generated';

export default function PicoUnitCard({
  pico,
  onRefresh,
}: {
  pico: PicoUnit;
  onRefresh?: (id: number) => void;
}) {
  const isWarning = (pico.failed_calls ?? 0) > 3;

  function friendlyDate(ts?: string) {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isWarning ? 'warning.main' : undefined,
        boxShadow: isWarning ? (theme) => `0 6px 20px ${theme.palette.warning.main}22` : undefined,
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: isWarning ? 'warning.main' : 'primary.main' }}>
            {pico.name?.charAt(0) ?? 'P'}
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="div">
              {pico.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pico.handle && `${pico.name ? pico.name + ' — ' : ''}${pico.handle}`}
            </Typography>
            {isWarning && (
              <Tooltip title={`Failed calls: ${pico.failed_calls}`}>
                <WarningAmberIcon color="warning" sx={{ ml: 0.5 }} />
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Last seen: {friendlyDate(pico.last_seen)}
          </Typography>
        }
      />

      <CardContent sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {pico.description ?? 'No description'}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Host: {pico.host ?? '—'}
          {pico.port ? `:${pico.port}` : ''}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>
            Enabled
          </Typography>
          <Switch checked={pico.enabled} disabled={true} />
        </Box>

        <Box>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => onRefresh?.(pico.id)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
}
