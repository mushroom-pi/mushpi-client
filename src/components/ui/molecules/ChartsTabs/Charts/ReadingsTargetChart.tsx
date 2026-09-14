import { alpha, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartsContext } from '~ctx/Charts';
import { createTickFormatter, isLongSpan } from '~utils/chartLabels';

import { FallbackChart } from './FallbackChart';

type ActualKey = 'temperature' | 'humidity';
type RangeKey = 'tempRange' | 'humidityRange';
type SetpointKey = 'temperatureSet' | 'humiditySet';

export interface ReadingsTargetChartProps {
  actualKey: ActualKey;
  rangeKey: RangeKey;
  unit: string;
  label: string;
  showXAxis?: boolean;
  height?: number;
}

const getLineColors = (
  actualKey: ActualKey,
  palette: {
    primary: { main: string };
    secondary: { main: string };
    info: { main: string };
    success: { main: string };
  },
) => {
  if (actualKey === 'humidity') {
    return {
      readings: palette.info.main,
      band: palette.info.main,
      target: palette.success.main,
    };
  }

  return {
    readings: palette.primary.main,
    band: palette.primary.main,
    target: palette.secondary.main,
  };
};

export const ReadingsTargetChart: React.FC<ReadingsTargetChartProps> = ({
  actualKey,
  rangeKey,
  unit,
  label,
  showXAxis = false,
  height,
}) => {
  const { chartsData: data } = useChartsContext();
  const { palette } = useTheme();

  const showDate = isLongSpan(data);

  const axisCompensation = showXAxis ? (showDate ? 60 : 50) : 0;
  const chartHeight = (height ?? 200) + axisCompensation;
  const colors = getLineColors(actualKey, palette);

  // Derive setpoint key from actualKey
  const setpointKey: SetpointKey = actualKey === 'temperature' ? 'temperatureSet' : 'humiditySet';

  const tickFormatter = useMemo(() => createTickFormatter(data), [data]);

  const yDomain = useMemo((): [number, number] | ['auto', 'auto'] => {
    if (!data.length) return ['auto', 'auto'];
    const values = data
      .flatMap((p) => {
        const range = p[rangeKey];
        return [
          p[actualKey] as number | undefined | null,
          p[setpointKey] as number | undefined | null,
          ...(range ?? []),
        ];
      })
      .filter((v): v is number => v != null && isFinite(v));
    if (!values.length) return ['auto', 'auto'];
    return [Math.min(...values) - 3, Math.max(...values) + 3];
  }, [data, actualKey, rangeKey, setpointKey]);

  return (
    <FallbackChart item={label}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={data}
          margin={{
            top: 4,
            right: 8,
            left: 0,
            bottom: 4,
          }}
          syncId="anyId"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
            tickFormatter={tickFormatter}
            hide={!showXAxis}
            angle={showDate ? -30 : undefined}
            textAnchor={showDate ? 'end' : undefined}
            height={showDate ? 60 : 50}
            tickMargin={4}
            minTickGap={30}
          />
          <YAxis unit={unit} tickCount={5} domain={yDomain} />
          <Tooltip labelFormatter={(ts) => dayjs(ts).format('MMM DD HH:mm')} />
          <Area
            name="Range"
            dataKey={rangeKey}
            stroke="none"
            fill={alpha(colors.band, 0.25)}
            fillOpacity={1}
          />
          <Line
            name="Readings"
            type="monotone"
            dataKey={actualKey}
            stroke={colors.readings}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            strokeWidth={2}
          />
          <Line
            name="Target"
            type="monotone"
            dataKey={setpointKey}
            stroke={colors.target}
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend verticalAlign="top" />
        </ComposedChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
