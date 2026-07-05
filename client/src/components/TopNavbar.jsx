import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Form, InputGroup, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { searchApi, notificationApi } from '../services/api';

export default function TopNavbar({ onToggleSidebar, onToggleCollapse }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await notificationApi.unreadCount();
        setUnread(data.count);
        const res = await notificationApi.list({ limit: 5, unread: 'true' });
        setNotifs(res.data.data || []);
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await searchApi(search);
        setResults(data.results || []);
        setShowSearch(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="top-navbar">
      <Button variant="link" className="text-dark p-0 me-2 d-lg-none" onClick={onToggleSidebar}>☰</Button>
      <Button variant="link" className="text-dark p-0 me-3 d-none d-lg-block" onClick={onToggleCollapse}>☰</Button>

      <div className="flex-grow-1 position-relative" ref={searchRef} style={{ maxWidth: 400 }}>
        <InputGroup size="sm">
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            placeholder="Global search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length && setShowSearch(true)}
          />
        </InputGroup>
        {showSearch && results.length > 0 && (
          <div className="search-dropdown">
            {results.map((r) => (
              <div key={`${r.type}-${r.id}`} className="search-item" onClick={() => { navigate(r.link); setShowSearch(false); setSearch(''); }}>
                <span><Badge bg="success" className="me-2">{r.type}</Badge>{r.label}</span>
                <small className="text-muted">{r.sub}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ms-auto d-flex align-items-center gap-2">
        <Button variant="outline-secondary" size="sm" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>

        <Dropdown align="end">
          <Dropdown.Toggle variant="link" className="text-dark text-decoration-none p-0 position-relative">
            🔔
            {unread > 0 && <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>{unread}</Badge>}
          </Dropdown.Toggle>
          <Dropdown.Menu className="notif-dropdown p-0">
            <div className="p-2 border-bottom fw-semibold">Notifications</div>
            {notifs.length === 0 ? <div className="p-3 text-muted text-center">No new notifications</div> : notifs.map((n) => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => n.link && navigate(n.link)}>
                <div className="fw-semibold small">{n.title}</div>
                <div className="text-muted small">{n.message}</div>
              </div>
            ))}
            <Dropdown.Item onClick={() => navigate('/notifications')}>View all</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown align="end">
          <Dropdown.Toggle variant="link" className="text-dark text-decoration-none d-flex align-items-center gap-2">
            <span className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
            <span className="d-none d-md-inline small">{user?.name}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {isAdmin && <Dropdown.Item disabled><Badge bg="success">Admin</Badge></Dropdown.Item>}
            <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/settings')}>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
