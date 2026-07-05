const PERMISSIONS = {
  admin: [
    'manage_users', 'manage_settings', 'backup_restore', 'delete_critical',
    'view_dashboard', 'manage_farms', 'manage_animals', 'manage_feed',
    'manage_production', 'manage_health', 'manage_sales', 'manage_finance',
    'view_reports', 'export_reports', 'view_analytics', 'view_activity_logs',
    'add_daily_records',
  ],
  user: [
    'view_dashboard', 'add_daily_records', 'update_assigned_animals',
    'record_milk', 'record_eggs', 'update_feed', 'record_health',
    'view_reports', 'edit_own_profile',
  ],
};

const hasPermission = (role, permission) => {
  const perms = PERMISSIONS[role] || [];
  return perms.includes(permission);
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const allowed = permissions.some((p) => hasPermission(req.user.role, p));
  if (!allowed) return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const getFarmFilter = (user) => {
  if (user.role === 'admin') return {};
  if (user.assigned_farm_id) return { farm_id: user.assigned_farm_id };
  return { created_by: user.id };
};

module.exports = { PERMISSIONS, hasPermission, requirePermission, requireAdmin, getFarmFilter };
