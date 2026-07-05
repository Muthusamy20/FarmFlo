import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import DataTable from '../components/DataTable';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', assigned_farm_id: '', is_active: true });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data: res } = await adminApi.users.list({ page, limit: 10 });
      setData(res.data);
      setPagination(res.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editItem) await adminApi.users.update(editItem.id, form);
      else await adminApi.users.create(form);
      toast.success('User saved');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'is_active', label: 'Active', render: (r) => r.is_active ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle mb-0">Manage system users</p></div>
        <Button onClick={() => { setEditItem(null); setForm({ name: '', email: '', password: '', role: 'user', assigned_farm_id: '', is_active: true }); setShowModal(true); }}>+ Add User</Button>
      </div>
      <DataTable columns={columns} data={data} pagination={pagination} loading={loading} onPageChange={load} onEdit={(item) => { setEditItem(item); setForm({ name: item.name, email: item.email, role: item.role, assigned_farm_id: item.assigned_farm_id || '', is_active: item.is_active, password: '' }); setShowModal(true); }} onDelete={(item) => adminApi.users.remove(item.id).then(() => { toast.success('User deactivated'); load(); })} canDelete />
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editItem ? 'Edit' : 'Add'} User</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="mb-3"><Form.Label>Name</Form.Label><Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Col>
            <Col md={6} className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Col>
            <Col md={6} className="mb-3"><Form.Label>{editItem ? 'New Password (optional)' : 'Password'}</Form.Label><Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Col>
            <Col md={6} className="mb-3"><Form.Label>Role</Form.Label><Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></Form.Select></Col>
            <Col md={6} className="mb-3"><Form.Label>Assigned Farm ID</Form.Label><Form.Control type="number" value={form.assigned_farm_id} onChange={(e) => setForm({ ...form, assigned_farm_id: e.target.value })} /></Col>
            <Col md={6} className="mb-3"><Form.Check type="checkbox" label="Active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="mt-4" /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></Modal.Footer>
      </Modal>
    </div>
  );
}
