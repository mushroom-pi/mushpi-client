import { Card, CardContent, CardHeader, Skeleton, type SxProps, type Theme } from '@mui/material';

export interface CardSkeletonProps {
  variant?: 'card' | 'widget';
  lines?: number;
  height?: number;
  sx?: SxProps<Theme>;
}

export function CardSkeleton({ variant = 'card', lines = 2, height, sx }: CardSkeletonProps) {
  return (
    <Card sx={sx}>
      <CardHeader
        avatar={
          <Skeleton
            variant="circular"
            width={variant === 'widget' ? 32 : 40}
            height={variant === 'widget' ? 32 : 40}
          />
        }
        title={<Skeleton variant="text" width="60%" height={28} />}
        subheader={<Skeleton variant="text" width="40%" height={16} />}
      />
      <CardContent>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            height={height ?? 20}
            width={i === lines - 1 ? '70%' : '100%'}
            sx={{ mb: i < lines - 1 ? 0.5 : 0 }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
