import { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { dashboardApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [summary, chartData, acts, cal] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.charts(7),
        dashboardApi.activities(),
        dashboardApi.calendar(),
      ]);
      setCards(summary.data.cards);
      setCharts(chartData.data);
      setActivities(acts.data.slice(0, 8));
      setEvents(cal.data.slice(0, 6));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  const milkChart = {
    labels: charts?.milkProduction?.map((d) => d.date) || [],
    datasets: [{ label: 'Milk (L)', data: charts?.milkProduction?.map((d) => d.value) || [], borderColor: '#2d6a4f', backgroundColor: 'rgba(45,106,79,0.1)', fill: true, tension: 0.4 }],
  };

  const eggChart = {
    labels: charts?.eggProduction?.map((d) => d.date) || [],
    datasets: [{ label: 'Eggs', data: charts?.eggProduction?.map((d) => d.value) || [], borderColor: '#bc6c25', backgroundColor: 'rgba(188,108,37,0.1)', fill: true, tension: 0.4 }],
  };

  const animalChart = {
    labels: ['Cows', 'Goats', 'Poultry'],
    datasets: [{ data: [charts?.animalDistribution?.cows || 0, charts?.animalDistribution?.goats || 0, charts?.animalDistribution?.poultry || 0], backgroundColor: ['#2d6a4f', '#40916c', '#bc6c25'] }],
  };

  const revenueChart = {
    labels: charts?.revenue?.map((d) => d.date) || [],
    datasets: [
      { label: 'Revenue', data: charts?.revenue?.map((d) => d.value) || [], backgroundColor: '#2d6a4f' },
      { label: 'Expenses', data: charts?.expenses?.map((d) => d.value) || [], backgroundColor: '#bc6c25' },
    ],
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome to FarmFlo – Smart Farm Management</p>

      <Row className="g-3 mb-4">
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🏡" label="Total Farms" value={cards?.totalFarms || 0} /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🐄" label="Total Cows" value={cards?.totalCows || 0} /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🐐" label="Total Goats" value={cards?.totalGoats || 0} /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🐔" label="Poultry Birds" value={cards?.totalPoultry || 0} /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🥛" label="Today's Milk" value={cards?.todayMilk || 0} suffix=" L" color="info" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🥚" label="Today's Eggs" value={cards?.todayEggs || 0} color="warning" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🌾" label="Feed Stock" value={cards?.feedStock || 0} suffix=" kg" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🏥" label="Sick Animals" value={cards?.sickAnimals || 0} color="danger" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="💉" label="Vaccinations Due" value={cards?.vaccinationsDue || 0} color="warning" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="🤰" label="Pregnant Animals" value={cards?.pregnantAnimals || 0} color="info" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="📈" label="Monthly Income" value={cards?.monthlyIncome || 0} prefix="₹" color="success" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="📉" label="Monthly Expenses" value={cards?.monthlyExpenses || 0} prefix="₹" color="danger" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="💰" label="Total Sales" value={cards?.totalSales || 0} prefix="₹" /></Col>
        <Col xs={6} md={4} lg={3} xl={2}><StatCard icon="✨" label="Profit" value={cards?.profit || 0} prefix="₹" color={cards?.profit >= 0 ? 'success' : 'danger'} /></Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="chart-card h-100">
            <Card.Header>Milk Production (7 Days)</Card.Header>
            <Card.Body style={{ height: 280 }}><Line data={milkChart} options={chartOptions} /></Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="chart-card h-100">
            <Card.Header>Egg Production (7 Days)</Card.Header>
            <Card.Body style={{ height: 280 }}><Line data={eggChart} options={chartOptions} /></Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="chart-card h-100">
            <Card.Header>Animal Distribution</Card.Header>
            <Card.Body style={{ height: 280 }}><Doughnut data={animalChart} options={{ responsive: true, maintainAspectRatio: false }} /></Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="chart-card h-100">
            <Card.Header>Revenue vs Expenses</Card.Header>
            <Card.Body style={{ height: 280 }}><Bar data={revenueChart} options={{ ...chartOptions, plugins: { legend: { display: true } } }} /></Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <Card className="chart-card">
            <Card.Header>Recent Activities</Card.Header>
            <ListGroup variant="flush">
              {activities.length === 0 ? <ListGroup.Item className="text-muted">No recent activity</ListGroup.Item> : activities.map((a) => (
                <ListGroup.Item key={a.id}>
                  <div className="d-flex justify-content-between">
                    <span className="small"><Badge bg="success" className="me-1">{a.module}</Badge>{a.action}</span>
                    <small className="text-muted">{new Date(a.created_at).toLocaleDateString()}</small>
                  </div>
                  <small className="text-muted">{a.user?.name} – {a.details}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="chart-card">
            <Card.Header>Upcoming Events</Card.Header>
            <ListGroup variant="flush">
              {events.length === 0 ? <ListGroup.Item className="text-muted">No upcoming events</ListGroup.Item> : events.map((e) => (
                <ListGroup.Item key={e.id}>
                  <div className="fw-semibold small">{e.title}</div>
                  <small className="text-muted">{e.date} · {e.type}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="chart-card bg-primary-custom text-white">
            <Card.Body className="p-4">
              <h5>Quick Actions</h5>
              <ListGroup variant="flush" className="mt-3">
                {[
                  { label: 'Record Milk Production', path: '/milk' },
                  { label: 'Record Egg Collection', path: '/eggs' },
                  { label: 'Add Health Record', path: '/health' },
                  { label: 'View AI Insights', path: '/ai-insights' },
                ].map((a) => (
                  <ListGroup.Item key={a.path} action href={a.path} className="bg-transparent text-white border-light">
                    → {a.label}
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
