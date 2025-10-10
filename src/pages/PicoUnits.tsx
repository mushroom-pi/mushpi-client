import { usePicoUnits } from '../hooks/usePicoUnits';

export default function PicoUnitsPage() {
  const { data, isLoading, isError, error, refetch } = usePicoUnits({ page: 1, limit: 20 });

  if (isLoading) return <div>Loading pico units…</div>;
  if (isError) return <div>Error loading pico units: {(error as any)?.message}</div>;

  return (
    <div>
      <h1>Pico Units</h1>
      <button onClick={() => refetch()}>Refresh</button>
      <div>
        Showing page {data?.page} of {data?.pages} — total: {data?.total}
      </div>

      <ul>
        {data?.items?.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> ({p.handle}) — {p.description}
            <div>
              Host: {p.host}:{p.port} — Last seen: {p.last_seen}
            </div>
          </li>
        )) ?? <li>No pico units</li>}
      </ul>
    </div>
  );
}
