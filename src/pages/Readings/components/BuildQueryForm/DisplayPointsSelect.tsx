import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
  Tooltip,
} from '@mui/material';

const AGGREGATION_POINT_OPTIONS = [50, 100, 200, 500, 1000, 2000];
const AUTO_VALUE = 'auto';

const AGGREGATION_INFO_TEXT =
  'Readings are grouped into buckets and averaged. Each point shows the min, max, and average within its time bucket. Full raw data is available via Download CSV.';

export const DisplayPointsSelect = ({
  value,
  onChange,
  height,
  sx,
}: {
  value: number | 'auto';
  onChange: (n: number | 'auto') => void;
  height?: number;
  sx?: SxProps<Theme>;
}) => (
  <FormControl sx={{ minWidth: 160, width: { xs: '100%', xl: 'auto' }, ...sx }} size="medium">
    <InputLabel id="display-points-label">
      Aggregation points
      <Tooltip title={AGGREGATION_INFO_TEXT} arrow placement="top">
        <InfoOutlinedIcon
          sx={{
            fontSize: 14,
            marginLeft: 0.5,
            verticalAlign: 'middle',
            color: 'text.secondary',
            cursor: 'help',
          }}
        />
      </Tooltip>
    </InputLabel>
    <Select
      labelId="display-points-label"
      value={String(value)}
      label="Aggregation points"
      size="medium"
      onChange={(e: SelectChangeEvent) => {
        const v = e.target.value;
        onChange(v === AUTO_VALUE ? AUTO_VALUE : Number(v));
      }}
      sx={{
        '& .MuiSelect-select': {
          height,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      <MenuItem value={AUTO_VALUE}>Auto</MenuItem>
      {AGGREGATION_POINT_OPTIONS.map((n) => (
        <MenuItem key={n} value={String(n)}>
          {n}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText sx={{ minHeight: '1.2em' }}> </FormHelperText>
  </FormControl>
);
