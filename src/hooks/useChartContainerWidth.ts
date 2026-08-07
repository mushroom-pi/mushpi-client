import { useEffect, useRef, useState } from 'react';

const DEFAULT_WIDTH = 800;
const DEBOUNCE_MS = 200;
const MIN_POINTS = 10;
const MAX_POINTS = 2000;

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

/**
 * Observes the width of a container element and derives a suitable
 * aggregation `points` value (1:1 with pixel width, clamped to 10–2000).
 * Resize events are debounced by 200 ms.
 */
export const useChartContainerWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [points, setPoints] = useState(() =>
    clamp(Math.round(DEFAULT_WIDTH / 10) * 10, MIN_POINTS, MAX_POINTS),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.round(entry.contentRect.width);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setWidth(w), DEBOUNCE_MS);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Quantize to nearest 10 to prevent 1-px ResizeObserver jitter from
  // producing a new queryKey (and therefore a new query observer that
  // resets refetchInterval).
  useEffect(() => {
    const quantized = clamp(Math.round(width / 10) * 10, MIN_POINTS, MAX_POINTS);
    setPoints((prev) => (prev === quantized ? prev : quantized));
  }, [width]);

  return { ref, width, points };
};
