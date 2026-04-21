import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Side - Graphic/Brand */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-header">
            <p>Global learning made simple – AI study solutions for you.</p>
          </div>
          
          <div className="auth-left-main">
            <h1>Start<br />your journey</h1>
            
            {/* Phone Mockup Representation */}
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="phone-header">
                  <span className="date">Week 4-10 July</span>
                  <div className="icon-calendar"></div>
                </div>
                <div className="balance">
                  <span className="amount">897.00</span>
                  <span className="currency">pts</span>
                </div>
                <div className="chart">
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '50%'}}></div>
                  <div className="bar highlight" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '70%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                </div>
                <div className="category-section">
                  <span className="cat-title">Category</span>
                  <span className="cat-amount">950.00</span>
                </div>
                <div className="widgets">
                  <div className="widget-box light"></div>
                  <div className="widget-box dark"></div>
                  <div className="widget-box darkest"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <div className="accessibility-icon">
              <span>⧓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-right-content">
          <div className="auth-right-header">
            <Link to="/" className="auth-logo-modern" style={{ textDecoration: 'none' }}>
              <div className="circle-logo"></div>
              <span className="logo-text">StudyAI</span>
            </Link>
            <Link to="/login" className="auth-signup-link">
              <span className="user-icon">◎</span> Sign In
            </Link>
          </div>

          <div className="auth-form-container">
            <h2 className="auth-heading">Sign Up</h2>
            
            {error && <div className="alert alert-error" role="alert">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              <div className="form-group-modern">
                <input
                  id="reg-name"
                  type="text"
                  className="input-modern"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>

              <div className="form-group-modern">
                <input
                  id="reg-email"
                  type="email"
                  className="input-modern"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group-modern">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="input-modern"
                  placeholder="Password (Min. 6 chars)"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '👁' : '⏚'} 
                </button>
              </div>

              <button id="register-submit" type="submit" className="btn-modern-submit" disabled={loading}>
                {loading ? <><span className="spinner-modern" /></> : <><span>→</span> Create Account</>}
              </button>
            </form>

            {/* Google Sign Up */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <button
              id="register-google"
              type="button"
              className="btn-google"
              onClick={loginWithGoogle}
              aria-label="Sign up with Google"
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="auth-right-footer">
            <div className="footer-links">
              <Link to="#">Contact Us</Link>
              <span className="lang-selector">English ⌄</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
