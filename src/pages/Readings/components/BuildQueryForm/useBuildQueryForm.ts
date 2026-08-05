import type { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import type { ReadingsApiPicoUnitIdReadingsControllerListForUnitV1Request as ListPicoUnitReadingsParams } from '~api/generated';
import { useChartsContext } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useExportPicoUnitReadingsCmd } from '~hook/useReadings';

import type { LocalParams } from './interfaces';
import { buildInitialLocalParams, resolveBoundaryParam } from './methods';

export function useBuildQueryForm() {
  const { units: picoUnits = [] } = usePicoUnitsContext();
  const { params, setParams, points, setPoints } = useChartsContext();

  const [localParams, setLocalParams] = useState<LocalParams>(() =>
    buildInitialLocalParams(params),
  );
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);

  // Keep local draft in sync when applied params change externally (e.g. initial unit selection)
  useEffect(() => {
    setLocalParams(buildInitialLocalParams(params));
  }, [params?.start, params?.end, params?.picoUnitId, params?.points]);

  const start = localParams.start ?? null;
  const end = localParams.end ?? null;

  const isEndBeforeStart = useMemo(() => {
    if (!start || !end) return false;
    return end.isBefore(start);
  }, [start, end]);

  const hasPicoUnit = Boolean(localParams?.picoUnitId ?? params?.picoUnitId);
  const isUpdateDisabled = !hasPicoUnit || isEndBeforeStart;

  // Download operates on the applied (chart) query, not the local draft
  const isDownloadDisabled = !params?.start || !params?.end || isUpdateDisabled;
  const downloadTooltip =
    !params?.start || !params?.end
      ? 'Apply a time window to the charts first to enable CSV download'
      : 'Downloads all raw readings for the selected time period — no aggregation applied';

  const currentPicoUnitValue = String(localParams?.picoUnitId ?? params?.picoUnitId ?? '');

  const exportCsv = useExportPicoUnitReadingsCmd();

  const update = (overrideParams?: LocalParams) => {
    const source = overrideParams ?? localParams;
    const picoUnitId = source?.picoUnitId != null ? Number(source.picoUnitId) : params?.picoUnitId;
    if (!picoUnitId) return;

    const merged: ListPicoUnitReadingsParams = {
      ...(params ?? {}),
      picoUnitId,
      start: resolveBoundaryParam(source.start, params?.start),
      end: resolveBoundaryParam(source.end, params?.end),
      points: source?.points ?? params?.points,
    };
    setParams(merged);
  };

  const onPicoUnitChange = (val: number) => {
    const next = { ...localParams, picoUnitId: val };
    setLocalParams(next);
    update(next);
  };

  const onStartChange = (v: Dayjs | null) => setLocalParams((prev) => ({ ...prev, start: v }));

  const onEndChange = (v: Dayjs | null) => setLocalParams((prev) => ({ ...prev, end: v }));

  const onUpdateClick = () => update();

  const onApplyPresetRange = (
    _preset: 'recent' | '1h' | '6h' | '24h' | '7d',
    range: { start: Dayjs | null; end: Dayjs | null },
  ) => {
    const nextParams: LocalParams = { ...localParams, start: range.start, end: range.end };
    setLocalParams(nextParams);
    update(nextParams);
  };

  const download = async () => {
    if (!params?.picoUnitId || !params.start || !params.end) return;

    setIsFetchingCsv(true);
    try {
      // params.start/end are already backend ISO strings (set via resolveBoundaryParam)
      const blob = await exportCsv({
        picoUnitId: params.picoUnitId,
        start: params.start,
        end: params.end,
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
    onApplyPresetRange,
    download,
  };
}
