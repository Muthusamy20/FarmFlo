import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Check your email for reset link');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <div className="auth-header"><h1>🔑 Reset Password</h1></div>
      <Card.Body className="p-4">
        {sent ? (
          <Alert variant="success">If that email exists, a reset link has been sent. Check console in dev mode.</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          </Form>
        )}
        <p className="text-center mt-3 mb-0 small"><Link to="/auth/login">Back to Login</Link></p>
      </Card.Body>
    </Card>
  );
}
