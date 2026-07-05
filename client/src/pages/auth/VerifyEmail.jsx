import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { authApi } from '../../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card className="auth-card">
      <Card.Body className="p-4 text-center">
        {status === 'loading' && <><Spinner animation="border" variant="success" /><p className="mt-3">Verifying email...</p></>}
        {status === 'success' && <><div className="fs-1">✅</div><h5>Email Verified!</h5><Link to="/auth/login">Go to Login</Link></>}
        {status === 'error' && <><Alert variant="danger">Verification failed or link expired.</Alert><Link to="/auth/login">Go to Login</Link></>}
      </Card.Body>
    </Card>
  );
}
