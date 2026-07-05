import { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { aiApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AIInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi.insights().then(({ data: d }) => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!data) return <Alert variant="warning">Unable to load AI insights</Alert>;

  const { predictions, recommendations } = data;

  const milkForecastChart = {
    labels: predictions.milkHistorical?.map((d) => d.date) || [],
    datasets: [
      { label: 'Historical Milk', data: predictions.milkHistorical?.map((d) => d.value) || [], borderColor: '#2d6a4f' },
      { label: 'Forecast', data: [...Array(predictions.milkHistorical?.length || 0).fill(null), ...predictions.milkForecast?.map((d) => d.predicted) || []], borderColor: '#bc6c25', borderDash: [5, 5] },
    ],
  };

  return (
    <div>
      <h1 className="page-title">AI Insights</h1>
      <p className="page-subtitle">Smart predictions and farm recommendations</p>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6>Disease Risk Score</h6>
              <div className="ai-gauge" style={{ borderColor: predictions.diseaseRisk > 50 ? '#dc3545' : '#2d6a4f' }}>
                {predictions.diseaseRisk}%
              </div>
              <p className="text-muted small mt-2">{predictions.diseaseRisk > 50 ? 'High risk – take action' : 'Risk is manageable'}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6>Farm Performance Score</h6>
              <div className="ai-gauge" style={{ borderColor: '#40916c' }}>{predictions.performanceScore}%</div>
              <p className="text-muted small mt-2">Composite KPI score</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>Smart Recommendations</Card.Header>
            <ListGroup variant="flush">
              {(recommendations.recommendations || []).map((r, i) => (
                <ListGroup.Item key={i} className="small">{r}</ListGroup.Item>
              ))}
            </ListGroup>
            {!recommendations.available && (
              <Card.Body><Alert variant="info" className="mb-0 small">{recommendations.message}</Alert></Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header>Milk Production Forecast</Card.Header>
            <Card.Body style={{ height: 300 }}>
              <Line data={milkForecastChart} options={{ responsive: true, maintainAspectRatio: false }} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header>Egg Production Forecast (7 Days)</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {predictions.eggForecast?.map((d) => (
                  <ListGroup.Item key={d.day} className="d-flex justify-content-between">
                    <span>Day +{d.day}</span>
                    <strong>{d.predicted} eggs</strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
