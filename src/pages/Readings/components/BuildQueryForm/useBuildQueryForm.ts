import type { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import type { ChartsReadingsParams } from '~ctx/Charts';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useExportPicoUnitReadingsCmd } from '~hook/useReadings';
import type { RangePreset } from '~utils/timeWindow';
import { dayjsFromTimeWindow } from '~utils/timeWindow';

import type { LocalParams } from './interfaces';
import { buildInitialLocalParams, buildTimeWindowFromLocal } from './methods';

type PresetState = RangePreset | 'recent' | 'custom';

export function useBuildQueryForm() {
  const { units: picoUnits = [] } = usePicoUnitsContext();
  const { params, setParams, points, setPoints } = useChartsContext();

  const [localParams, setLocalParams] = useState<LocalParams>(() =>
    buildInitialLocalParams(params),
  );
  const [preset, setPreset] = useState<PresetState>(() => {
    if (!params) return 'recent';
    return dayjsFromTimeWindow(params.timeWindow).preset;
  });
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);

  // Keep local draft in sync when applied params change externally (e.g. initial unit selection)
  useEffect(() => {
    setLocalParams(buildInitialLocalParams(params));
    if (params) {
      setPreset(dayjsFromTimeWindow(params.timeWindow).preset);
    }
  }, [params?.timeWindow, params?.picoUnitId, params?.points]);

  const start = localParams.start ?? null;
  const end = localParams.end ?? null;

  const isEndBeforeStart = useMemo(() => {
    if (!start || !end) return false;
    return end.isBefore(start);
  }, [start, end]);

  const hasPicoUnit = Boolean(localParams?.picoUnitId ?? params?.picoUnitId);
  const isUpdateDisabled = !hasPicoUnit || isEndBeforeStart;

  // Download operates on the applied (chart) query, not the local draft
  const isDownloadDisabled = params?.timeWindow?.kind === 'none' || isUpdateDisabled;
  const downloadTooltip =
    params?.timeWindow?.kind === 'none'
      ? 'Apply a time window to the charts first to enable CSV download'
      : 'Downloads all raw readings for the selected time period — no aggregation applied';

  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');

  const exportCsv = useExportPicoUnitReadingsCmd();

  const update = (overrideParams?: LocalParams, overridePreset?: PresetState) => {
    const source = overrideParams ?? localParams;
    const currentPreset = overridePreset ?? preset;
    const picoUnitId = source?.picoUnitId != null ? Number(source.picoUnitId) : params?.picoUnitId;
    if (!picoUnitId) return;

    const timeWindow = buildTimeWindowFromLocal(currentPreset, source.start ?? null, source.end ?? null);

    const merged: ChartsReadingsParams = {
      picoUnitId,
      points: source?.points ?? params?.points ?? 200,
      timeWindow,
    };
    setParams(merged);
  };

  const onPicoUnitChange = (val: number) => {
    const next = { ...localParams, picoUnitId: val };
    setLocalParams(next);
    update(next);
  };

  const onStartChange = (v: Dayjs | null) => {
    setLocalParams((prev) => ({ ...prev, start: v }));
    // Switching to custom dates
    setPreset('custom');
  };

  const onEndChange = (v: Dayjs | null) => {
    setLocalParams((prev) => ({ ...prev, end: v }));
    setPreset('custom');
  };

  const onUpdateClick = () => update();

  const onPresetChange = (newPreset: PresetState) => {
    setPreset(newPreset);
  };

  const onApplyPresetRange = (
    newPreset: 'recent' | RangePreset,
    _range: { start: Dayjs | null; end: Dayjs | null },
  ) => {
    // For presets, clear local start/end and set the preset
    const nextParams: LocalParams = { ...localParams, start: null, end: null };
    setLocalParams(nextParams);
    setPreset(newPreset);
    update(nextParams, newPreset);
  };

  const download = async () => {
    if (!params?.picoUnitId || params.timeWindow.kind === 'none') return;

    setIsFetchingCsv(true);
    try {
      const blob = await exportCsv({
        picoUnitId: params.picoUnitId,
        timeWindow: params.timeWindow,
      });

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `readings-${params.picoUnitId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsFetchingCsv(false);
    }
  };

  return {
    // data
    picoUnits,
    // aggregation points
    points,
    setPoints,
    // derived UI values
    currentPicoUnitValue,
    currentStartValue: start,
    currentEndValue: end,
    preset,
    // validation
    isEndBeforeStart,
    isUpdateDisabled,
    isDownloadDisabled,
    downloadTooltip,
    // CSV state
    isFetchingCsv,
    // handlers
    onPicoUnitChange,
    onStartChange,
    onEndChange,
    onUpdateClick,
    onPresetChange,
    onApplyPresetRange,
    download,
  };
}
