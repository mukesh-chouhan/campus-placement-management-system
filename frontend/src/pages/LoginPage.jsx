import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
      toast.error(err || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const [roleTab, setRoleTab] = useState('STUDENT'); // 'STUDENT' or 'ADMIN'

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-sidebar">
        <div className="auth-brand">
          <div className="sidebar-logo">P</div>
          <span className="brand-text" style={{ fontSize: '1.6rem' }}>PLACEHUB</span>
        </div>

        <div className="auth-tagline">
          <h2>Your Campus Career.<br />One Platform.</h2>
          <p>Streamlined placement drives, real-time eligibility checking, and direct applications. Empowering students and administrators.</p>
        </div>

        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} PlaceHub. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-workspace">
        <div className="auth-box">
          <h1>Sign In</h1>
          <p className="auth-subtitle">Access your campus placement workspace.</p>

          {/* Role Selection Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
            <button
              type="button"
              className={`btn ${roleTab === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 0', fontSize: '0.85rem' }}
              onClick={() => { setRoleTab('STUDENT'); setEmail(''); setPassword(''); }}
            >
              🎓 Student Portal
            </button>
            <button
              type="button"
              className={`btn ${roleTab === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 0', fontSize: '0.85rem' }}
              onClick={() => { setRoleTab('ADMIN'); setEmail(''); setPassword(''); }}
            >
              🛡️ Admin Hub
            </button>
          </div>

          {error && <div className="reasons-banner" style={{ marginBottom: 20 }}><span className="reasons-title">Error</span>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have a student account?{' '}
            <Link to="/register" className="auth-link">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
