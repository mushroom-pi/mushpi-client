import { Container } from '@mui/material';
import type { PropsWithChildren } from 'react';

export const Page = ({ children }: PropsWithChildren) => (
  <Container sx={{ py: 4 }}>{children}</Container>
);
