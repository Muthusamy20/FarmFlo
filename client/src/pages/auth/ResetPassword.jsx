import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successful!');
      navigate('/auth/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <div className="auth-header"><h1>🔑 New Password</h1></div>
      <Card.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {!token && <Alert variant="warning">Invalid reset link</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <InputGroup>
              <Form.Control type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁'}</Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading || !token}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
        </Form>
        <p className="text-center mt-3 mb-0 small"><Link to="/auth/login">Back to Login</Link></p>
      </Card.Body>
    </Card>
  );
}
