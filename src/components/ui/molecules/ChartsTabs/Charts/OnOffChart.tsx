import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartsContext } from '~ctx/Charts';
import type { AggregatedChartPoint } from '~type/charts';
import { createTickFormatter, isLongSpan } from '~utils/chartLabels';

import { FallbackChart } from './FallbackChart';

type BinaryKey = Extract<
  keyof AggregatedChartPoint,
  'fanOn' | 'humidifierOn' | 'heaterOn' | 'controlLoopEnabled'
>;

type CountKey = Extract<
  keyof AggregatedChartPoint,
  'fanOnCount' | 'humidifierOnCount' | 'heaterOnCount' | 'controlLoopEnabledCount'
>;

const COUNT_KEY_MAP: Record<BinaryKey, CountKey> = {
  fanOn: 'fanOnCount',
  humidifierOn: 'humidifierOnCount',
  heaterOn: 'heaterOnCount',
  controlLoopEnabled: 'controlLoopEnabledCount',
};

const LABEL_MAP: Record<BinaryKey, string> = {
  fanOn: 'Fan',
  humidifierOn: 'Humidifier',
  heaterOn: 'Heater',
  controlLoopEnabled: 'Control loop',
};

export interface OnOffChartProps {
  dataKey: BinaryKey;
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

  const countKey = COUNT_KEY_MAP[dataKey];
  const label = LABEL_MAP[dataKey];

  return (
    <FallbackChart item={dataKey}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
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
            ticks={[0, 1]}
            domain={[-0.1, 1.1]}
            tickFormatter={(tick) => (tick === 0 ? 'OFF' : 'ON')}
          />
          <Tooltip
            labelFormatter={(ts) => dayjs(ts).format('MMM DD HH:mm')}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as AggregatedChartPoint;
              const isOn = point[dataKey] === 1;
              const count = point[countKey];
              const total = point.readingCount;
              return (
                <div
                  style={{
                    backgroundColor: palette.background.paper,
                    border: `1px solid ${palette.divider}`,
                    borderRadius: 4,
                    padding: '8px 12px',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {dayjs(point.ts).format('MMM DD HH:mm')}
                  </div>
                  <div>
                    {label}: <strong>{isOn ? 'ON' : 'OFF'}</strong> ({count}/{total} readings)
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="stepAfter"
            dataKey={dataKey}
            stroke={palette.primary.main}
            fill={palette.primary.main}
            fillOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </FallbackChart>
  );
};
