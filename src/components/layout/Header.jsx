import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

const Header = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <header className="app-header">
      <button className="sidebar-toggle" onClick={onSidebarToggle} aria-label="Open sidebar" style={{ display: 'none' }}>
        <span aria-hidden="true">☰</span>
      </button>
      <div className="header-left">
        <div className="header-breadcrumb">
          <Link to="/" className="breadcrumb-link">
            <span className="breadcrumb-app">AI Study Assistant</span>
          </Link>
        </div>
      </div>
      <div className="header-right">
        {user?.isAdmin && (
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>
            ⚙ Admin
          </button>
        )}
        <div className="user-info">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
