import { Container } from '@mui/material';
import type { PropsWithChildren } from 'react';

export const Page = ({ children }: PropsWithChildren) => (
  <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
    {children}
  </Container>
);
