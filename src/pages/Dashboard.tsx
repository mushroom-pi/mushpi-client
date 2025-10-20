import Card from '~comp/Card';

export default function Dashboard() {
  return (
    <div className="container">
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <div className="row">
        <div className="col">
          <Card title="Growth overview">
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>42%</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Humidity index (last 24h)</div>
              </div>
              <div style={{ minWidth: 120 }}>
                {/* placeholder for a small sparkline or icon */}
                <div
                  style={{
                    height: 48,
                    background: 'linear-gradient(90deg,var(--leaf), var(--accent))',
                    borderRadius: 8,
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="col">
          <Card title="Environment">
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li>
                Temp: <strong>22.1°C</strong>
              </li>
              <li>
                Humidity: <strong>85%</strong>
              </li>
              <li>
                CO₂: <strong>420 ppm</strong>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="row">
        <div className="col">
          <Card title="Recent logs">
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No alerts in the last 24h</div>
          </Card>
        </div>
        <div className="col">
          <Card title="Controls">
            <button
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 0,
                background: 'var(--accent)',
                color: 'var(--bg)',
                fontWeight: 700,
              }}
            >
              Irrigation
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
