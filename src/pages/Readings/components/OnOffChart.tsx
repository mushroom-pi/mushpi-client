import { useTheme } from '@mui/material';
import type React from 'react';
import { Brush, CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';

import { useChartsContext } from '~ctx/Charts';
import type { ChartLabel } from '~type/charts';

import { FallbackChart } from './FallbackChart';

export interface OnOffChartProps {
  dataKey: ChartLabel;
  showXAxis?: boolean;
  showBrush?: boolean;
}

export const OnOffChart: React.FC<OnOffChartProps> = ({
  dataKey,
  showXAxis = false,
  showBrush = false,
}) => {
  const { chartsData: data, commonTicks } = useChartsContext();
  const { palette } = useTheme();

  return (
    <FallbackChart item={dataKey}>
      <ScatterChart
        style={{ height: showXAxis ? '12vh' : '7vh', width: '90%' }}
        responsive
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
        <Scatter type="monotone" dataKey={dataKey} fill={palette.primary.main} />
        {showBrush && <Brush height={15} />}
      </ScatterChart>
    </FallbackChart>
  );
};
