import { Container } from '@mui/material';

import { CardSkeleton } from '~components';

export const SettingsSkeleton = () => (
  <Container maxWidth="sm">
    <CardSkeleton variant="card" lines={3} />
  </Container>
);
