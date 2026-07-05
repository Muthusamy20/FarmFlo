import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import DataTable from './DataTable';
import { crudApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ModulePage({ title, subtitle, resource, columns, fields, imageField }) {
  const { isAdmin } = useAuth();
  const api = crudApi(resource);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.list({ page, limit: 10, search, sort: sortField, order: sortOrder });
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortField, sortOrder, resource]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditItem(null);
    const initial = {};
    fields.forEach((f) => { initial[f.name] = f.defaultValue ?? ''; });
    setForm(initial);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const vals = {};
    fields.forEach((f) => { vals[f.name] = item[f.name] ?? ''; });
    setForm(vals);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (imageField) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (v === '' || v === null || v === undefined) return;
          if (k === imageField && typeof v === 'string') return;
          if (k === imageField && v instanceof File) fd.append(k, v);
          else if (k !== imageField || v instanceof File) fd.append(k, v);
        });
        if (editItem) await api.update(editItem.id, fd);
        else await api.create(fd);
      } else {
        const payload = { ...form };
        if (editItem) await api.update(editItem.id, payload);
        else await api.create(payload);
      }
      toast.success(editItem ? 'Updated successfully' : 'Created successfully');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.remove(item.id);
      toast.success('Deleted successfully');
      loadData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const renderField = (field) => {
    const val = form[field.name] ?? '';
    const onChange = (v) => setForm({ ...form, [field.name]: v });

    if (field.type === 'select') {
      return (
        <Form.Select value={val} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select...</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Form.Select>
      );
    }
    if (field.type === 'textarea') {
      return <Form.Control as="textarea" rows={2} value={val} onChange={(e) => onChange(e.target.value)} />;
    }
    if (field.type === 'checkbox') {
      return <Form.Check type="checkbox" checked={!!val} onChange={(e) => onChange(e.target.checked)} />;
    }
    if (field.type === 'file') {
      return <Form.Control type="file" accept="image/*" onChange={(e) => onChange(e.target.files[0])} />;
    }
    return <Form.Control type={field.type || 'text'} value={val} onChange={(e) => onChange(field.type === 'number' ? e.target.value : e.target.value)} step={field.step} />;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle mb-0">{subtitle}</p>
        </div>
        <Button onClick={openCreate}>+ Add New</Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        loading={loading}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        onPageChange={setPage}
        onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        sortField={sortField}
        sortOrder={sortOrder}
        onEdit={openEdit}
        onDelete={handleDelete}
        canDelete={isAdmin}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Edit' : 'Add'} {title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {fields.map((field) => (
              <Col md={field.col || 6} key={field.name} className="mb-3">
                <Form.Label>{field.label}{field.required && ' *'}</Form.Label>
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
