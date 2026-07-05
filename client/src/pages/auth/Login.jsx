import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      toast.success('Welcome to FarmFlo!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <div className="auth-header">
        <h1>🌿 FarmFlo</h1>
        <p>Smart Farm Integrated Management System</p>
      </div>
      <Card.Body className="p-4">
        <h5 className="mb-3">Sign In</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Enter email" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Enter password" />
              <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁'}</Button>
            </InputGroup>
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check type="checkbox" label="Remember me" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
            <Link to="/auth/forgot-password" className="small">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-100" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
        </Form>
        <p className="text-center mt-3 mb-0 small">Don't have an account? <Link to="/auth/register">Register</Link></p>
      </Card.Body>
    </Card>
  );
}
