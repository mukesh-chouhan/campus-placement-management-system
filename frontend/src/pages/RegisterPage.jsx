import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    branch: 'Computer Science & Engineering (CSE)',
    cgpa: '',
    backlogs: '0',
    graduationYear: '2026',
    skills: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Process skills into a List of String
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        cgpa: parseFloat(formData.cgpa),
        backlogs: parseInt(formData.backlogs),
        graduationYear: parseInt(formData.graduationYear),
        skills: skillsArray
      };

      await register(payload);
      toast.success('Registration successful! Welcome to PlaceHub.');
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      toast.error(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-sidebar">
        <div className="auth-brand">
          <div className="sidebar-logo">P</div>
          <span className="brand-text" style={{ fontSize: '1.6rem' }}>PLACEHUB</span>
        </div>

        <div className="auth-tagline">
          <h2>Kickstart Your Professional Journey.</h2>
          <p>Register as a student, complete your academic profile, view hiring drives, check instant eligibility, and apply with ease.</p>
        </div>

        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} PlaceHub. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-workspace">
        <div className="auth-box" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Register Student Profile</h1>
          <p className="auth-subtitle" style={{ marginBottom: '20px' }}>Create your placement account to find recruitment drives.</p>

          {error && <div className="reasons-banner" style={{ marginBottom: 20 }}><span className="reasons-title">Error</span>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rohit Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. mukeshchouhan@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 chars"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Retype password"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="rollNumber">Roll Number / ID</label>
                <input
                  id="rollNumber"
                  type="text"
                  className="form-control"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. CS2023001"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch">Academic Branch</label>
                <select
                  id="branch"
                  className="form-control"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Computer Science & Engineering (AI & ML)">Computer Science & Engineering (AI & ML)</option>
                  <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
                  <option value="Computer Science & Engineering (Cyber Security)">Computer Science & Engineering (Cyber Security)</option>
                  <option value="Computer Science & Engineering (IoT)">Computer Science & Engineering (IoT)</option>
                  <option value="Computer Science & Engineering (Cloud Computing)">Computer Science & Engineering (Cloud Computing)</option>
                  <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
                  <option value="Computer Science & Engineering (Machine Learning)">Computer Science & Engineering (Machine Learning)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Electronics & Communication Engineering (ECE)">Electronics & Communication Engineering (ECE)</option>
                  <option value="Electrical & Electronics Engineering (EEE)">Electrical & Electronics Engineering (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cgpa">Cumulative CGPA</label>
                <input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="10.00"
                  className="form-control"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="0.00 to 10.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="backlogs">Active Backlogs</label>
                <input
                  id="backlogs"
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.backlogs}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="graduationYear">Graduation Year</label>
                <input
                  id="graduationYear"
                  type="number"
                  min="2020"
                  className="form-control"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  id="skills"
                  type="text"
                  className="form-control"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. Java, React, SQL"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Profile'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '16px' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
