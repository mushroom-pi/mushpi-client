import { useTheme } from '@mui/material';
import type React from 'react';
import {
  Brush,
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

import { FallbackChart } from './FallbackChart';

export interface OnOffChartProps {
  dataKey: ChartLabel;
  showXAxis?: boolean;
  showBrush?: boolean;
  height?: number;
}

export const OnOffChart: React.FC<OnOffChartProps> = ({
  dataKey,
  showXAxis = false,
  showBrush = false,
  height,
}) => {
  const { chartsData: data, commonTicks } = useChartsContext();
  const { palette } = useTheme();

  const chartHeight = height ?? (showXAxis ? 200 : 120);

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
          <XAxis dataKey="label" hide={!showXAxis} ticks={commonTicks} />
          <YAxis
            dataKey={dataKey}
            ticks={[0, 1]}
            domain={[-0.2, 1.2]}
            tickFormatter={(tick) => (tick === 0 ? 'OFF' : 'ON')}
          />
          <Tooltip />
          <Line
            type="stepAfter"
            dataKey={dataKey}
            stroke={palette.primary.main}
            isAnimationActive={false}
          />
          {showBrush && <Brush height={15} />}
        </LineChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
