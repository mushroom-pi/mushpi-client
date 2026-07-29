import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardUnitItemDto } from '~api/generated';

interface ActiveBatchesWidgetProps {
  items: DashboardUnitItemDto[];
}

export function ActiveBatchesWidget({ items }: ActiveBatchesWidgetProps) {
  const navigate = useNavigate();

  const activeBatches = items
    .filter((u) => u.activeBatch)
    .map((u) => ({
      batchId: u.activeBatch!.id,
      name: u.activeBatch!.name,
      daysRemaining: u.activeBatch!.daysRemaining,
      unitHandle: u.handle,
    }));

  if (activeBatches.length === 0) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Batches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No active batches
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Batches
        </Typography>
        <Stack spacing={1.5}>
          {activeBatches.map((b) => (
            <Card
              key={b.batchId}
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => navigate(`/batches/${b.batchId}`)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2">{b.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {b.unitHandle}
                  </Typography>
                  <Chip label={`${b.daysRemaining}d remaining`} size="small" />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
