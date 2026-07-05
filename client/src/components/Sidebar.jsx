import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard', perm: 'all' },
    { to: '/ai-insights', icon: '🤖', label: 'AI Insights', perm: 'all' },
  ]},
  { section: 'Farm Management', items: [
    { to: '/farms', icon: '🏡', label: 'Farms', perm: 'all' },
    { to: '/cows', icon: '🐄', label: 'Cows', perm: 'all' },
    { to: '/goats', icon: '🐐', label: 'Goats', perm: 'all' },
    { to: '/poultry', icon: '🐔', label: 'Poultry', perm: 'all' },
    { to: '/feed', icon: '🌾', label: 'Feed Inventory', perm: 'all' },
  ]},
  { section: 'Production', items: [
    { to: '/milk', icon: '🥛', label: 'Milk Production', perm: 'all' },
    { to: '/eggs', icon: '🥚', label: 'Egg Production', perm: 'all' },
  ]},
  { section: 'Health', items: [
    { to: '/health', icon: '🏥', label: 'Health Records', perm: 'all' },
    { to: '/vaccinations', icon: '💉', label: 'Vaccinations', perm: 'all' },
    { to: '/breeding', icon: '🧬', label: 'Breeding', perm: 'all' },
  ]},
  { section: 'Finance', items: [
    { to: '/sales', icon: '💰', label: 'Sales', perm: 'all' },
    { to: '/customers', icon: '👥', label: 'Customers', perm: 'all' },
    { to: '/expenses', icon: '📉', label: 'Expenses', perm: 'all' },
    { to: '/income', icon: '📈', label: 'Income', perm: 'all' },
  ]},
  { section: 'Reports', items: [
    { to: '/reports', icon: '📋', label: 'Reports', perm: 'all' },
    { to: '/notifications', icon: '🔔', label: 'Notifications', perm: 'all' },
  ]},
  { section: 'Admin', items: [
    { to: '/users', icon: '👤', label: 'Users', perm: 'admin' },
    { to: '/activity-logs', icon: '📝', label: 'Activity Logs', perm: 'admin' },
    { to: '/settings', icon: '⚙️', label: 'Settings', perm: 'all' },
  ]},
];

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🌿</div>
        <span className="sidebar-brand-text">FarmFlo</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((section) => {
          const items = section.items.filter((i) => i.perm === 'all' || (i.perm === 'admin' && isAdmin));
          if (!items.length) return null;
          return (
            <div key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
