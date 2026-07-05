import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      setSuccess(true);
      toast.success('Registration successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="auth-card">
        <Card.Body className="p-4 text-center">
          <div className="fs-1 mb-3">✅</div>
          <h5>Registration Successful!</h5>
          <p className="text-muted">Please check your email to verify your account.</p>
          <Link to="/auth/login"><Button>Go to Login</Button></Link>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="auth-card">
      <div className="auth-header"><h1>🌿 FarmFlo</h1><p>Create your account</p></div>
      <Card.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁'}</Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
        </Form>
        <p className="text-center mt-3 mb-0 small">Already have an account? <Link to="/auth/login">Sign In</Link></p>
      </Card.Body>
    </Card>
  );
}
