import Card from '../components/Card';

export default function Settings() {
  return (
    <div className="container">
      <h1>Settings</h1>
      <Card title="General">
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Grow Profile
            <select
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              <option>Standard</option>
              <option>Fruiting</option>
            </select>
          </label>
          <label>
            Notification threshold
            <input type="range" min={0} max={100} />
          </label>
        </div>
      </Card>
    </div>
  );
}
