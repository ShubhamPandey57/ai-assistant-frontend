import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/documents', icon: '📄', label: 'Documents' },
  { to: '/settings',  icon: '⚙️', label: 'Settings' },
];

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <Link to="/" className="sidebar-logo" onClick={onClose}>
        <div className="circle-logo-sidebar"></div>
        <span className="logo-text">StudyAI</span>
      </Link>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-actions">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item action-item home-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </NavLink>
        <button className="nav-item action-item logout-item" onClick={handleLogout}>
          <span className="nav-icon">⎋</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <p className="sidebar-version">AI Study Assistant v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
