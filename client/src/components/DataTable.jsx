import { Table, Pagination, Form, Button, Spinner } from 'react-bootstrap';

export default function DataTable({
  columns, data, pagination, loading,
  onSearch, onPageChange, onSort, sortField, sortOrder,
  onEdit, onDelete, canDelete = false,
}) {
  const handleSort = (field) => {
    if (onSort) onSort(field, sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="data-table-wrapper">
      <div className="table-toolbar">
        <Form.Control
          type="search"
          placeholder="Search..."
          style={{ maxWidth: 280 }}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        {pagination && <small className="text-muted">{pagination.total} records</small>}
      </div>
      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>
      ) : (
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ cursor: col.sortable ? 'pointer' : 'default' }} onClick={() => col.sortable && handleSort(col.key)}>
                  {col.label} {sortField === col.key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="text-center text-muted py-4">No records found</td></tr>
            ) : data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    {onEdit && <Button size="sm" variant="outline-primary" className="me-1" onClick={() => onEdit(row)}>Edit</Button>}
                    {onDelete && canDelete && <Button size="sm" variant="outline-danger" onClick={() => onDelete(row)}>Delete</Button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center p-3">
          <Pagination>
            <Pagination.Prev disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} />
            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
              const p = i + 1;
              return <Pagination.Item key={p} active={p === pagination.page} onClick={() => onPageChange(p)}>{p}</Pagination.Item>;
            })}
            <Pagination.Next disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)} />
          </Pagination>
        </div>
      )}
    </div>
  );
}
