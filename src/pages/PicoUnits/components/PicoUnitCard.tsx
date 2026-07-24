import RefreshIcon from '@mui/icons-material/Refresh';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { PicoUnit } from '~api/generated';
import { UnitHealthIcon } from '~components';
import { isUnitOffline } from '~utils/pico';

export default function PicoUnitCard({
  pico,
  onRefresh,
  onReconnect,
}: {
  pico: PicoUnit;
  onRefresh?: (id: number) => void;
  onReconnect?: (pico: PicoUnit) => void;
}) {
  const navigate = useNavigate();
  const offline = isUnitOffline(pico);

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
        ...(offline && {
          opacity: 0.7,
          filter: 'grayscale(0.4)',
        }),
      }}
    >
      {/* CardActionArea makes the main card content clickable */}
      <CardActionArea
        onClick={() => {
          // navigate to the detail page for this pico unit
          navigate(`/pico-units/${pico.id}`);
        }}
        sx={{ textAlign: 'left', alignItems: 'stretch' }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: pico.face_color ?? 'primary.main' }}>
              {pico.name?.charAt(0) ?? 'P'}
            </Avatar>
          }
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" component="div" noWrap>
                {pico.name}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 0.5 }}>
                {pico.handle}
              </Typography>
            </Box>
          }
          subheader={
            <Box display="flex" alignItems="center" gap={0.5}>
              <UnitHealthIcon pico={pico} />
              <Typography variant="caption" color="text.secondary">
                Last seen: {friendlyDate(pico.last_seen)}
              </Typography>
            </Box>
          }
        />

        <CardContent sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" paragraph noWrap>
            {pico.description ?? 'No description'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Host: {pico.host ?? '—'}
            {pico.port ? `:${pico.port}` : ''}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>
            Enabled
          </Typography>
          {/* display only, disabled */}
          <Switch checked={!!pico.enabled} disabled />
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          {offline && onReconnect && (
            <Button
              size="small"
              startIcon={<WifiTetheringIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onReconnect(pico);
              }}
            >
              Reconnect
            </Button>
          )}
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={(e) => {
                // prevent CardActionArea navigation when clicking refresh
                e.stopPropagation();
                onRefresh?.(pico.id);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
}
