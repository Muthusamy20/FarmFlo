import { Card } from 'react-bootstrap';

export default function StatCard({ icon, label, value, color = 'success', prefix = '', suffix = '' }) {
  const bgMap = { success: '#d8f3dc', warning: '#fff3cd', danger: '#f8d7da', info: '#cff4fc', primary: '#d1e7dd' };
  return (
    <Card className="stat-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</div>
            <div className="stat-label">{label}</div>
          </div>
          <div className="stat-icon" style={{ background: bgMap[color] || bgMap.success }}>{icon}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
