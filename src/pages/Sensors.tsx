import Card from '../components/Card';

export default function Sensors() {
  return (
    <div className="container">
      <h1>Sensors</h1>
      <div className="row">
        <div className="col">
          <Card title="Sensor 1">Temp: 21.9°C</Card>
        </div>
        <div className="col">
          <Card title="Sensor 2">Humidity: 84%</Card>
        </div>
        <div className="col">
          <Card title="Sensor 3">Soil: 45%</Card>
        </div>
      </div>
    </div>
  );
}
