import { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { notificationApi } from '../services/api';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await notificationApi.list({ limit: 50 });
      setNotifs(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await notificationApi.markAllRead();
    load();
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle mb-0">Smart alerts and reminders</p>
        </div>
        <Button variant="outline-primary" onClick={markAll}>Mark All Read</Button>
      </div>
      <Card>
        <ListGroup variant="flush">
          {notifs.length === 0 ? (
            <ListGroup.Item className="text-center text-muted py-5">No notifications</ListGroup.Item>
          ) : notifs.map((n) => (
            <ListGroup.Item key={n.id} className={!n.is_read ? 'bg-light' : ''}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Badge bg="success" className="me-2">{n.type}</Badge>
                  <strong>{n.title}</strong>
                  <p className="mb-0 text-muted small mt-1">{n.message}</p>
                  <small className="text-muted">{new Date(n.created_at).toLocaleString()}</small>
                </div>
                {!n.is_read && (
                  <Button size="sm" variant="outline-secondary" onClick={() => notificationApi.markRead(n.id).then(load)}>Mark Read</Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
}
