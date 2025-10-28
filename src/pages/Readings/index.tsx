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
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { ChartsProvider } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useCharts } from '~hook/useCharts';

import ControlLoopCard from './components/ControlLoopCard';
import { DevicesCard } from './components/DevicesCard';
import { TempHumCard } from './components/TempHumCard';

export const ReadingsPage = () => {
  const [picoUnitId, setPicoUnitId] = useState<number | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(500);

  // ---- load list of pico units
  const { units: picoUnits, isLoadingPicoUnits, isErrorPicoUnits } = usePicoUnitsContext();

  // selectedId falls back to the first unit id if local state is null
  const selectedId = picoUnitId ?? picoUnits?.[0]?.id ?? null;

  // keep local state in sync (optional) so UI can still change selection later
  useEffect(() => {
    if (picoUnitId == null && picoUnits?.length) {
      setPicoUnitId(picoUnits[0].id);
    }
  }, [picoUnits, picoUnitId]);

  const { chartsData, labels, commonTicks, isLoading, isFetching, refetch } = useCharts({
    picoUnitId: selectedId,
    start,
    end,
    page,
    limit,
  });

  return (
    <ChartsProvider chartsData={chartsData} labels={labels} commonTicks={commonTicks}>
      <Container sx={{ py: 4 }}>
        <Box>
          {picoUnits.length > 0 && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
              <FormControl sx={{ minWidth: 240 }}>
                <InputLabel id="pico-unit-selector-label">Pico Unit</InputLabel>
                <Select
                  labelId="pico-unit-selector-label"
                  id="pico-unit-selector"
                  label="Pico Unit"
                  value={picoUnitId != null ? String(picoUnitId) : ''}
                  onChange={(e: SelectChangeEvent) => setPicoUnitId(Number(e.target.value))}
                >
                  {picoUnits.map(({ id, name, handle }) => (
                    <MenuItem key={id} value={String(id)}>
                      {name ?? handle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Start (local)"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={start ? toInputDatetimeLocal(start) : ''}
                onChange={(e) => setStart(e.target.value ? new Date(e.target.value) : null)}
              />

              <TextField
                label="End (local)"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={end ? toInputDatetimeLocal(end) : ''}
                onChange={(e) => setEnd(e.target.value ? new Date(e.target.value) : null)}
              />

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="limit-label">Limit</InputLabel>
                <Select
                  labelId="limit-label"
                  value={String(limit)}
                  label="Limit"
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </FormControl>

              <IconButton onClick={() => refetch?.()} aria-label="refresh">
                <RefreshIcon />
              </IconButton>

              <Box flex={1} />

              <Typography variant="body2" color="text.secondary">
                {isFetching ? 'Fetching...' : isLoading ? 'Loading...' : 'Ready'}
              </Typography>
            </Stack>
          )}

          <Stack spacing={2}>
            <Stack direction="column" spacing={2}>
              <TempHumCard />
              <DevicesCard />
              <ControlLoopCard />
            </Stack>

            {/* <Card>
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
            </Card> */}
          </Stack>
        </Box>
      </Container>
    </ChartsProvider>
  );
};

/** helper: convert Date -> input[type="datetime-local"] string local */
function toInputDatetimeLocal(d: Date) {
  // YYYY-MM-DDThh:mm (browser expects local, avoid timezone 'Z')
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  // seconds typically omitted; include if you prefer: :pad(d.getSeconds())
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
