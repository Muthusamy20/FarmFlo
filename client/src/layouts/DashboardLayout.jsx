import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <TopNavbar
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
