import type React from 'react';
import { Brush, CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';

import { mushroom } from 'src/theme/mushroomTheme';

export interface OnOffChartProps {
  dataKey: string;
  data: any[];
  showXAxis?: boolean;
  showBrush?: boolean;
  commonTicks: any[];
}

export const OnOffChart: React.FC<OnOffChartProps> = ({
  dataKey,
  data,
  commonTicks,
  showXAxis = false,
  showBrush = false,
}) => (
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
    <Scatter type="monotone" dataKey={dataKey} fill={mushroom.accent} />
    {showBrush && <Brush height={15} />}
  </ScatterChart>
);
