import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartsContext } from '~ctx/Charts';
import type { ChartLabel } from '~type/charts';
import { createTickFormatter, isLongSpan } from '~utils/chartLabels';

import { FallbackChart } from './FallbackChart';

export interface OnOffChartProps {
  dataKey: ChartLabel;
  showXAxis?: boolean;
  height?: number;
}

export const OnOffChart: React.FC<OnOffChartProps> = ({
  dataKey,
  showXAxis = false,
  height,
}) => {
  const { chartsData: data } = useChartsContext();
  const { palette } = useTheme();

  const showDate = isLongSpan(data);

  const axisCompensation = showXAxis ? (showDate ? 60 : 50) : 0;
  const chartHeight = (height ?? 120) + axisCompensation;

  const tickFormatter = useMemo(() => createTickFormatter(data), [data]);

  return (
    <FallbackChart item={dataKey}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: -10,
            bottom: 5,
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
          <YAxis
            dataKey={dataKey}
            ticks={[0, 1]}
            domain={[-0.2, 1.2]}
            tickFormatter={(tick) => (tick === 0 ? 'OFF' : 'ON')}
          />
          <Tooltip labelFormatter={(ts) => dayjs(ts).format('MMM DD HH:mm')} />
          <Line
            type="stepAfter"
            dataKey={dataKey}
            stroke={palette.primary.main}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
