import dayjs from 'dayjs';

export const nowDateTimeLocal = () => dayjs().format('YYYY-MM-DDTHH:mm');

export function computeFinishAt(start: string, durationDays: number) {
  return dayjs(start).add(durationDays, 'day').format('YYYY-MM-DDTHH:mm');
}
