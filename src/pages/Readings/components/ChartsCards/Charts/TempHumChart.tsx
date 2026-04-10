import { useTheme } from '@mui/material';
import type React from 'react';
import {
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

export const TempHumChart: React.FC = () => {
  const { chartsData: data, commonTicks } = useChartsContext();
  const { palette } = useTheme();

  return (
    <FallbackChart item="temperature and humidity">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
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
          <XAxis dataKey="label" ticks={commonTicks} />
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
            stroke={palette.text.secondary}
            fill={palette.text.secondary}
            activeDot={{ r: 8 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            yAxisId="left"
            dataKey="temperature_target"
            stroke={palette.primary.main}
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            yAxisId="right"
            dataKey="humidity"
            stroke={palette.warning.main}
            fill={palette.warning.main}
            activeDot={{ r: 8 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            yAxisId="right"
            dataKey="humidity_target"
            stroke={palette.success.main}
            dot={false}
            strokeWidth={2}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
