import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { adminApi } from '../services/api';

export default function ActivityLogsPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.activityLogs({ page: 1, limit: 20 }).then(({ data: res }) => {
      setData(res.data);
      setPagination(res.pagination);
    }).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleString() },
    { key: 'user', label: 'User', render: (r) => r.user?.name || 'System' },
    { key: 'module', label: 'Module' },
    { key: 'action', label: 'Action' },
    { key: 'details', label: 'Details' },
  ];

  return (
    <div>
      <h1 className="page-title">Activity Logs</h1>
      <p className="page-subtitle">System audit trail</p>
      <DataTable columns={columns} data={data} pagination={pagination} loading={loading} />
    </div>
  );
}
