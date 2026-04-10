import { useTheme } from '@mui/material';
import type React from 'react';
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartsContext } from '~ctx/Charts';

import { FallbackChart } from './FallbackChart';

type ActualKey = 'temperature' | 'humidity';
type TargetKey = 'temperature_target' | 'humidity_target';

export interface ReadingsTargetChartProps {
  actualKey: ActualKey;
  targetKey: TargetKey;
  unit: string;
  label: string;
  showXAxis?: boolean;
  showBrush?: boolean;
  height?: number;
}

const BRUSH_HEIGHT = 20;
const BRUSH_COMPENSATION = 24;

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
      target: palette.success.main,
    };
  }

  return {
    readings: palette.primary.main,
    target: palette.secondary.main,
  };
};

export const ReadingsTargetChart: React.FC<ReadingsTargetChartProps> = ({
  actualKey,
  targetKey,
  unit,
  label,
  showXAxis = false,
  showBrush = false,
  height,
}) => {
  const { chartsData: data, commonTicks } = useChartsContext();
  const { palette } = useTheme();

  const baseHeight = height ?? (showXAxis ? 220 : 200);
  const chartHeight = baseHeight + (showBrush ? BRUSH_COMPENSATION : 0);
  const colors = getLineColors(actualKey, palette);

  return (
    <FallbackChart item={label}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
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
          <XAxis dataKey="label" hide={!showXAxis} ticks={commonTicks} />
          <YAxis
            dataKey={actualKey}
            unit={unit}
            tickCount={5}
            domain={['dataMin-3', 'dataMax+3']}
          />
          <Tooltip />
          <Line
            name="Readings"
            type="monotone"
            dataKey={actualKey}
            stroke={colors.readings}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line
            name="Target"
            type="monotone"
            dataKey={targetKey}
            stroke={colors.target}
            dot={false}
            strokeWidth={2}
          />
          {showBrush && <Brush dataKey="label" height={BRUSH_HEIGHT} />}
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
