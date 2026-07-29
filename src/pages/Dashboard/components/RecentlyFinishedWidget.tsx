import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardFinishedBatchDto } from '~api/generated';

import { formatRelativeFromNow } from '../methods';

interface RecentlyFinishedWidgetProps {
  batches: DashboardFinishedBatchDto[];
}

export function RecentlyFinishedWidget({ batches }: RecentlyFinishedWidgetProps) {
  const navigate = useNavigate();

  if (batches.length === 0) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recently Finished
        </Typography>
        <Stack spacing={1.5}>
          {batches.map((b) => (
            <Card
              key={b.id}
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => navigate(`/batches/${b.id}`)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2">{b.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {b.species}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {b.picoUnitHandle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Finished {formatRelativeFromNow(b.finishedAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
