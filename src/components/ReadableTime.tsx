import { Tooltip, Typography } from '@mui/material';
import React from 'react';

function readableTime(
  totalSeconds?: number | null,
  opts?: { compact?: boolean; padHours?: boolean },
): string {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return '—';
  }

  const seconds = Math.floor(totalSeconds);

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (v: number) => (v < 10 ? `0${v}` : `${v}`);

  if (opts?.compact) {
    // compact: "2d 03:04:05" (omit days if 0 -> "03:04:05", omit hours if days=0 and hours=0 -> "04:05")
    const hh = (opts?.padHours ?? true) ? pad(hours) : `${hours}`;
    const mm = pad(minutes);
    const ss = pad(secs);

    if (days > 0) return `${days}d ${hh}:${mm}:${ss}`;
    if (hours > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }

  // verbose: "2 days, 3 hours, 4 minutes, 5 seconds"
  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  if (secs || parts.length === 0) parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);

  return parts.join(', ');
}

interface ReadableTimeProps {
  seconds?: number | null;
  compact?: boolean; // compact format by default false
  showTooltip?: boolean; // show verbose text in a tooltip when compact is used
  variant?: 'body2' | 'body1' | 'caption' | 'subtitle2' | 'h6';
}

export const ReadableTime: React.FC<ReadableTimeProps> = ({
  seconds,
  compact = false,
  showTooltip = true,
  variant = 'body2',
}) => {
  const text = readableTime(seconds, { compact });
  if (compact && showTooltip) {
    const long = readableTime(seconds, { compact: false });
    return (
      <Tooltip title={long}>
        <Typography variant={variant} component="span">
          {text}
        </Typography>
      </Tooltip>
    );
  }
  return (
    <Typography variant={variant} component="span">
      {text}
    </Typography>
  );
};
