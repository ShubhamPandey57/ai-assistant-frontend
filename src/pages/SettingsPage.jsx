import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  updateProfile,
  changePassword,
  changeEmail,
  changeAdminId,
} from '../api/auth.api';
import api from '../api/axios.config';
import './SettingsPage.css';

const TABS = [
  { id: 'profile',    icon: '👤', label: 'Profile' },
  { id: 'appearance', icon: '🎨', label: 'Appearance' },
  { id: 'security',   icon: '🔒', label: 'Security' },
  { id: 'report',     icon: '🐛', label: 'Report Issue' },
];

const Toast = ({ msg, type, onClose }) => (
  <div className={`settings-toast settings-toast--${type}`}>
    <span>{type === 'success' ? '✅' : '⚠️'} {msg}</span>
    <button onClick={onClose} className="settings-toast-close">✕</button>
  </div>
);

const PasswordInput = ({ value, onChange, id, autoComplete, placeholder, minLength }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        className="settings-input"
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{ 
          position: 'absolute', 
          right: '12px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px'
        }}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
};

const SettingsPage = () => {
  const { user, setUserFromGoogle } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await updateProfile({ name: profile.name, bio: profile.bio });
      setUserFromGoogle(res.data.user); // reuse the setter to update context
      const stored = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const newUser = { ...stored, name: res.data.user.name, bio: res.data.user.bio };
      if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(newUser));
      else sessionStorage.setItem('user', JSON.stringify(newUser));
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password state ────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match.', 'error'); return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      showToast('New password cannot be the same as the current password.', 'error'); return;
    }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Email / Admin ID state ────────────────────────────────────────────────
  const [credForm, setCredForm] = useState({ newValue: '', password: '' });
  const [credLoading, setCredLoading] = useState(false);

  const handleCredChange = async (e) => {
    e.preventDefault();
    if (user?.isAdmin && credForm.newValue === user?.adminId) {
      showToast('New Admin ID cannot be the same as the current Admin ID.', 'error'); return;
    } else if (!user?.isAdmin && credForm.newValue === user?.email) {
      showToast(`New Email Address cannot be the same as the current Email Address.`, 'error'); return;
    }
    setCredLoading(true);
    try {
      let res;
      if (user?.isAdmin) {
        res = await changeAdminId({ newAdminId: credForm.newValue, password: credForm.password });
      } else {
        res = await changeEmail({ newEmail: credForm.newValue, password: credForm.password });
      }
      const stored = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const updated = user?.isAdmin
        ? { ...stored, adminId: res.data.adminId }
        : { ...stored, email: res.data.email };
      if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updated));
      else sessionStorage.setItem('user', JSON.stringify(updated));
      setUserFromGoogle(updated);
      setCredForm({ newValue: '', password: '' });
      showToast(res.data.message || 'Updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update.', 'error');
    } finally {
      setCredLoading(false);
    }
  };

  // ── Report state ──────────────────────────────────────────────────────────
  const [report, setReport] = useState({ subject: '', category: 'bug', message: '' });
  const [reportLoading, setReportLoading] = useState(false);

  const handleReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await api.post('/contact', {
        name: user?.name || 'Unknown',
        email: user?.email || 'noreply@studyai.app',
        subject: `[${report.category.toUpperCase()}] ${report.subject}`,
        message: report.message,
      });
      setReport({ subject: '', category: 'bug', message: '' });
      showToast('Report submitted! Thank you for your feedback.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit report.', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  // ── Avatar initials ───────────────────────────────────────────────────────
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="settings-page">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1>Settings <span className="gradient-text">⚙️</span></h1>
          <p style={{ marginTop: 4 }}>Manage your account, appearance & security</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar tabs */}
        <nav className="settings-tabs-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content panels */}
        <div className="settings-panel">

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Profile Information</h2>
                <p>Update your display name and bio. Your {user?.isAdmin ? 'Admin ID' : 'email'} is shown as read-only.</p>
              </div>

              <div className="settings-avatar-row">
                <div className="settings-avatar">{initials}</div>
                <div>
                  <div className="settings-avatar-name">{user?.name}</div>
                  <div className="settings-avatar-role">{user?.isAdmin ? '⚙️ Administrator' : '🎓 Student'}</div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="settings-form">
                <div className="settings-field">
                  <label className="settings-label">Display Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    className="settings-input"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    minLength={2}
                    required
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Bio <span className="settings-label-hint">(optional, max 160 chars)</span></label>
                  <textarea
                    id="settings-bio"
                    className="settings-input settings-textarea"
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    maxLength={160}
                    rows={3}
                    placeholder="Tell us a little about yourself..."
                  />
                  <span className="settings-char-count">{profile.bio.length}/160</span>
                </div>

                <div className="settings-field">
                  <label className="settings-label">{user?.isAdmin ? 'Admin ID' : 'Email Address'} <span className="settings-label-hint">(read-only — change in Security tab)</span></label>
                  <input
                    type="text"
                    className="settings-input settings-input--readonly"
                    value={user?.isAdmin ? (user?.adminId || '—') : (user?.email || '—')}
                    readOnly
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Member Since</label>
                  <input
                    type="text"
                    className="settings-input settings-input--readonly"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    readOnly
                  />
                </div>

                <button id="settings-profile-save" type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? <><span className="spinner spinner--sm" /> Saving…</> : '💾 Save Profile'}
                </button>
              </form>

              {/* About section */}
              <div className="settings-about-card">
                <h3>About StudyAI</h3>
                <p>AI Study Assistant is an intelligent learning platform that helps students upload documents, generate flashcards, and interact with study material through AI-powered conversations.</p>
                <div className="settings-about-grid">
                  <div className="settings-about-item"><span className="settings-about-label">Version</span><span className="settings-about-value">v1.0 MVP</span></div>
                  <div className="settings-about-item"><span className="settings-about-label">AI Engine</span><span className="settings-about-value">Groq · Llama 3 70B</span></div>
                  <div className="settings-about-item"><span className="settings-about-label">Platform</span><span className="settings-about-value">Web</span></div>
                  <div className="settings-about-item"><span className="settings-about-label">Support</span><span className="settings-about-value">Use Report tab</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Appearance</h2>
                <p>Choose how StudyAI looks on your device. The theme is saved automatically.</p>
              </div>

              <div className="settings-theme-grid">
                {[
                  { id: 'light',  icon: '☀️', label: 'Light',  desc: 'Clean and bright' },
                  { id: 'dark',   icon: '🌙', label: 'Dark',   desc: 'Easy on the eyes' },
                  { id: 'system', icon: '💻', label: 'System', desc: 'Follows OS setting' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`theme-${opt.id}`}
                    className={`settings-theme-card ${theme === opt.id ? 'active' : ''}`}
                    onClick={() => setTheme(opt.id)}
                  >
                    <span className="settings-theme-icon">{opt.icon}</span>
                    <span className="settings-theme-label">{opt.label}</span>
                    <span className="settings-theme-desc">{opt.desc}</span>
                    {theme === opt.id && <span className="settings-theme-check">✓</span>}
                  </button>
                ))}
              </div>

              <div className="settings-preview-card">
                <div className="settings-preview-label">Current: <strong>{theme.charAt(0).toUpperCase() + theme.slice(1)}</strong></div>
                <p>Changes are applied immediately and saved to your browser.</p>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Security</h2>
                <p>Keep your account safe by updating your credentials regularly.</p>
              </div>

              {/* Change Password */}
              <div className="settings-security-block">
                <h3 className="settings-block-title">🔑 Change Password</h3>
                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="settings-field">
                    <label className="settings-label">Current Password</label>
                    <PasswordInput
                      id="settings-cur-password"
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">New Password</label>
                    <PasswordInput
                      id="settings-new-password"
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Confirm New Password</label>
                    <PasswordInput
                      id="settings-confirm-password"
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <button id="settings-pw-save" type="submit" className="btn btn-primary" disabled={pwLoading}>
                    {pwLoading ? <><span className="spinner spinner--sm" /> Updating…</> : '🔑 Update Password'}
                  </button>
                </form>
              </div>

              <div className="settings-divider" />

              {/* Change Email / Admin ID */}
              <div className="settings-security-block">
                <h3 className="settings-block-title">
                  {user?.isAdmin ? '🆔 Change Admin ID' : '📧 Change Email Address'}
                </h3>
                <form onSubmit={handleCredChange} className="settings-form">
                  <div className="settings-field">
                    <label className="settings-label">
                      New {user?.isAdmin ? 'Admin ID' : 'Email Address'}
                    </label>
                    <input
                      id="settings-new-credential"
                      type={user?.isAdmin ? 'text' : 'email'}
                      className="settings-input"
                      value={credForm.newValue}
                      onChange={e => setCredForm(p => ({ ...p, newValue: e.target.value }))}
                      required
                      placeholder={user?.isAdmin ? 'New Admin ID (min. 3 chars)' : 'new@email.com'}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Confirm with Password</label>
                    <PasswordInput
                      id="settings-cred-password"
                      value={credForm.password}
                      onChange={e => setCredForm(p => ({ ...p, password: e.target.value }))}
                      autoComplete="current-password"
                    />
                  </div>
                  <button id="settings-cred-save" type="submit" className="btn btn-primary" disabled={credLoading}>
                    {credLoading ? <><span className="spinner spinner--sm" /> Saving…</> : `✅ Update ${user?.isAdmin ? 'Admin ID' : 'Email'}`}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── REPORT ── */}
          {activeTab === 'report' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Report a Bug or Issue</h2>
                <p>Found something broken? Let us know and we'll get it fixed as soon as possible.</p>
              </div>

              <form onSubmit={handleReport} className="settings-form">
                <div className="settings-field">
                  <label className="settings-label">Category</label>
                  <div className="settings-category-pills">
                    {[
                      { id: 'bug',      label: '🐛 Bug Report' },
                      { id: 'feature',  label: '✨ Feature Request' },
                      { id: 'ui',       label: '🎨 UI Issue' },
                      { id: 'other',    label: '💬 Other' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        id={`report-cat-${cat.id}`}
                        className={`settings-pill ${report.category === cat.id ? 'active' : ''}`}
                        onClick={() => setReport(p => ({ ...p, category: cat.id }))}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Subject</label>
                  <input
                    id="settings-report-subject"
                    type="text"
                    className="settings-input"
                    value={report.subject}
                    onChange={e => setReport(p => ({ ...p, subject: e.target.value }))}
                    required
                    placeholder="Brief summary of the issue"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Description</label>
                  <textarea
                    id="settings-report-message"
                    className="settings-input settings-textarea"
                    value={report.message}
                    onChange={e => setReport(p => ({ ...p, message: e.target.value }))}
                    required
                    rows={5}
                    placeholder="Describe the issue in detail — what happened, what you expected, and steps to reproduce..."
                  />
                </div>

                <div className="settings-report-info">
                  <span>📌</span>
                  <span>Your report will be sent from <strong>{user?.name}</strong> ({user?.isAdmin ? user?.adminId : user?.email})</span>
                </div>

                <button id="settings-report-submit" type="submit" className="btn btn-primary" disabled={reportLoading}>
                  {reportLoading ? <><span className="spinner spinner--sm" /> Submitting…</> : '🚀 Submit Report'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
