import { useState } from 'react';
import { Card, Form, Button, Row, Col, Tab, Tabs, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authApi, adminApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async () => {
    try {
      const { data } = await authApi.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await authApi.uploadAvatar(fd);
      updateUser(data.user);
      toast.success('Avatar updated');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account</p>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                  {user?.avatar ? <img src={user.avatar} alt="" className="rounded-circle w-100 h-100 object-fit-cover" /> : user?.name?.charAt(0)}
                </div>
                <div>
                  <Form.Label className="btn btn-outline-primary btn-sm mb-0">
                    Upload Photo
                    <input type="file" hidden accept="image/*" onChange={uploadAvatar} />
                  </Form.Label>
                </div>
              </div>
              <Row>
                <Col md={6} className="mb-3"><Form.Label>Name</Form.Label><Form.Control value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Col>
                <Col md={6} className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Col>
              </Row>
              <Button onClick={saveProfile}>Save Profile</Button>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>Change Password</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3"><Form.Label>Current Password</Form.Label><Form.Control type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></Col>
                <Col md={4} className="mb-3"><Form.Label>New Password</Form.Label><Form.Control type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></Col>
                <Col md={4} className="mb-3"><Form.Label>Confirm</Form.Label><Form.Control type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></Col>
              </Row>
              <Button onClick={changePassword}>Change Password</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export function SettingsPage() {
  const { isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [backupStatus, setBackupStatus] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);

  const createBackup = async () => {
    try {
      const { data } = await adminApi.backup();
      setBackupStatus(`Backup created: ${data.filename}`);
      toast.success('Backup created');
    } catch {
      toast.error('Backup failed');
    }
  };

  const restoreBackup = async () => {
    if (!restoreFile) return;
    if (!window.confirm('This will restore the database. Continue?')) return;
    const fd = new FormData();
    fd.append('sqlFile', restoreFile);
    try {
      await adminApi.restore(fd);
      toast.success('Database restored');
    } catch {
      toast.error('Restore failed');
    }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">System preferences</p>
      <Tabs defaultActiveKey="general" className="mb-3">
        <Tab eventKey="general" title="General">
          <Card>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Theme</Form.Label>
                <Form.Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select defaultValue="en"><option value="en">English</option></Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>
        {isAdmin && (
          <Tab eventKey="backup" title="Backup & Restore">
            <Card>
              <Card.Body>
                <Button className="me-2" onClick={createBackup}>Create Backup</Button>
                {backupStatus && <Alert variant="success" className="mt-3">{backupStatus}</Alert>}
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>Restore from SQL file</Form.Label>
                  <Form.Control type="file" accept=".sql" onChange={(e) => setRestoreFile(e.target.files[0])} />
                </Form.Group>
                <Button variant="warning" onClick={restoreBackup} disabled={!restoreFile}>Restore Database</Button>
              </Card.Body>
            </Card>
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
