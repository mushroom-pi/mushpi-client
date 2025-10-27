import type React from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import { mushroom } from 'src/theme/mushroomTheme';

export interface TempHumChartProps {
  data: any[];
  commonTicks: any[];
}

export const TempHumChart: React.FC<TempHumChartProps> = ({ data, commonTicks }) => (
  <LineChart
    style={{ height: '30vh', width: '100%' }}
    responsive
    data={data}
    margin={{
      top: 0,
      right: -16,
      left: 0,
      bottom: 0,
    }}
    syncId="anyId"
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" orientation="top" ticks={commonTicks} />
    <YAxis
      dataKey="temperature"
      unit="°C"
      tickCount={4}
      yAxisId="left"
      domain={['dataMin-1', 'dataMax+1']}
    />
    <YAxis
      dataKey="humidity"
      unit="%"
      tickCount={4}
      yAxisId="right"
      orientation="right"
      domain={['dataMin-1', 'dataMax+1']}
    />
    <Tooltip />
    <Line
      type="monotone"
      yAxisId="left"
      dataKey="temperature"
      stroke={mushroom.muted}
      fill={mushroom.muted}
      activeDot={{ r: 8 }}
      strokeDasharray="5 5"
    />
    <Line
      type="monotone"
      yAxisId="left"
      dataKey="temperature_target"
      stroke={mushroom.accent}
      dot={false}
      strokeWidth={2}
    />
    <Line
      type="monotone"
      yAxisId="right"
      dataKey="humidity"
      stroke={mushroom.accent2}
      fill={mushroom.accent2}
      activeDot={{ r: 8 }}
      strokeDasharray="5 5"
    />
    <Line
      type="monotone"
      yAxisId="right"
      dataKey="humidity_target"
      stroke={mushroom.leaf}
      dot={false}
      strokeWidth={2}
    />
    <Legend />
  </LineChart>
);
