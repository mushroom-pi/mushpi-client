export type ChartLabel =
  | 'label'
  | 'temperature'
  | 'humidity'
  | 'readingCount'
  | 'board_used_mem'
  | 'fan'
  | 'heater'
  | 'humidifier'
  | 'control_loop';

export type AggregatedChartPoint = {
  label: string;
  ts: number;
  temperature: number | null;
  humidity: number | null;
  tempMin: number | null;
  tempMax: number | null;
  humidityMin: number | null;
  humidityMax: number | null;
  readingCount: number;
  fanOnCount: number;
  humidifierOnCount: number;
  heaterOnCount: number;
  controlLoopEnabledCount: number;
  temperatureSet: number | null;
  humiditySet: number | null;
  /** Derived for chart Area bands */
  tempRange?: [number, number];
  /** Derived for chart Area bands */
  humidityRange?: [number, number];
  /** Binary majority vote (0 or 1) */
  fanOn: number;
  /** Binary majority vote (0 or 1) */
  humidifierOn: number;
  /** Binary majority vote (0 or 1) */
  heaterOn: number;
  /** Binary majority vote (0 or 1) */
  controlLoopEnabled: number;
};
