export type ChartLabel =
  | 'label'
  | 'temperature'
  | 'humidity'
  | 'temperature_target'
  | 'humidity_target'
  | 'board_used_mem'
  | 'fan'
  | 'heater'
  | 'humidifier'
  | 'control_loop';

export type ChartPoint = {
  label: string;
  temperature?: number;
  humidity?: number;
  temperature_target?: number;
  humidity_target?: number;
  board_used_mem: string;
  fan: number;
  heater: number;
  humidifier: number;
  control_loop: number;
};
