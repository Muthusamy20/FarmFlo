import { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table, Spinner } from 'react-bootstrap';
import { reportApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState('monthly');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reportApi.types().then(({ data }) => setTypes(data.types)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await reportApi.generate(selected, { from, to, format: 'json' });
      setReport(data);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ from, to, format });
      const res = await fetch(`/api/reports/${selected}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected}-report.${format === 'xlsx' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Generate and export farm reports</p>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Report Type</Form.Label>
              <Form.Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {types.map((t) => <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>From</Form.Label>
              <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Col>
            <Col md={2}>
              <Form.Label>To</Form.Label>
              <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Col>
            <Col md={5} className="d-flex gap-2 flex-wrap">
              <Button onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
              <Button variant="outline-danger" onClick={() => exportReport('pdf')}>PDF</Button>
              <Button variant="outline-success" onClick={() => exportReport('xlsx')}>Excel</Button>
              <Button variant="outline-secondary" onClick={() => exportReport('csv')}>CSV</Button>
              <Button variant="outline-primary" onClick={handlePrint}>Print</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && <div className="text-center p-4"><Spinner animation="border" variant="success" /></div>}

      {report && !loading && (
        <Card>
          <Card.Header>{report.title} <small className="text-muted">({report.period?.start} to {report.period?.end})</small></Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead><tr>{report.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
