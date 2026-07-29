import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardApproachingBatchDto } from '~api/generated';

import { urgencyColor } from '../methods';

interface ApproachingCompletionWidgetProps {
  batches: DashboardApproachingBatchDto[];
}

export function ApproachingCompletionWidget({ batches }: ApproachingCompletionWidgetProps) {
  const navigate = useNavigate();

  if (batches.length === 0) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Approaching Completion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No batches approaching completion
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Approaching Completion
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
                  <Chip
                    label={`${b.daysRemaining}d left`}
                    size="small"
                    color={urgencyColor(b.daysRemaining)}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
