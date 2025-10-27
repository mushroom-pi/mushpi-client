import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Card,
  CardContent,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { ChartsProvider } from '~ctx/Charts';
import { useCharts } from '~hook/useCharts';

import ControlLoopCard from './components/ControlLoopCard';
import { DevicesCard } from './components/DevicesCard';
import { TempHumCard } from './components/TempHumCard';

export const ReadingsPage = () => {
  // const { pico } = usePicoUnitContext();

  // if (!pico) return <Loading />;
  const picoUnitId = 188;
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(500);

  const { data, chartsData, labels, commonTicks, isLoading, isFetching, refetch } = useCharts({
    picoUnitId: 188,
    limit: 100,
  });

  return (
    <ChartsProvider chartsData={chartsData} labels={labels} commonTicks={commonTicks}>
      <Container sx={{ py: 4 }}>
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
            <TextField
              label="Pico Unit ID"
              type="number"
              value={String(picoUnitId)}
              // onChange={(e) => setPicoUnitId(Number(e.target.value))}
              sx={{ width: 160 }}
            />

            <TextField
              label="Start (ISO)"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setStart(e.target.value ? new Date(e.target.value) : null)}
            />

            <TextField
              label="End (ISO)"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setEnd(e.target.value ? new Date(e.target.value) : null)}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="limit-label">Limit</InputLabel>
              <Select
                labelId="limit-label"
                value={limit}
                label="Limit"
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={() => refetch()} aria-label="refresh">
              <RefreshIcon />
            </IconButton>

            <Box flex={1} />

            <Typography variant="body2" color="text.secondary">
              {isFetching ? 'Fetching...' : isLoading ? 'Loading...' : 'Ready'}
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction="column" spacing={2}>
              <TempHumCard />
              <DevicesCard />
              <ControlLoopCard />
            </Stack>

            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>
                  Showing page {data?.page ?? page} of {data?.pages ?? '--'} — total{' '}
                  {data?.total ?? '--'}
                </Typography>

                <Box flex={1} />

                <Pagination
                  count={data?.pages ?? 1}
                  page={data?.page ?? page}
                  onChange={(_e, value) => {
                    setPage(value);
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    </ChartsProvider>
  );
};
