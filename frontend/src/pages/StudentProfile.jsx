import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Award, BookOpen, GraduationCap, FileText, Upload, ExternalLink } from 'lucide-react';

const StudentProfile = () => {
  const { updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    cgpa: '',
    backlogs: '',
    graduationYear: '',
    skills: ''
  });

  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a PDF document file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingResume(true);
    try {
      const res = await API.post('/api/students/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data);
      toast.success('PDF Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/students/me');
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        branch: res.data.branch || '',
        cgpa: res.data.cgpa || '',
        backlogs: res.data.backlogs !== undefined ? res.data.backlogs : '0',
        graduationYear: res.data.graduationYear || '2026',
        skills: res.data.skills ? res.data.skills.join(', ') : ''
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Error loading profile details.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        email: formData.email,
        branch: formData.branch,
        cgpa: parseFloat(formData.cgpa),
        backlogs: parseInt(formData.backlogs),
        graduationYear: parseInt(formData.graduationYear),
        skills: skillsArray
      };

      const res = await API.put('/api/students/me', payload);
      setProfile(res.data);
      updateLocalUser(res.data); // sync AuthContext state
      setIsEditing(false);
      toast.success('Your profile has been updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>My Profile</h1>
          <span className="header-subtitle">Manage your personal information, academic details, and skill sets.</span>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>



      <div className="content-card">
        {isEditing ? (
          <form onSubmit={handleSave}>
            <h2 className="card-title" style={{ marginBottom: 24 }}>Edit Personal Details</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
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
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="branch">Branch / Specialization</label>
                <select
                  id="branch"
                  className="form-control"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
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
                  required
                />
              </div>
            </div>

            <div className="form-grid">
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
              <div className="form-group">
                <label htmlFor="graduationYear">Graduation Year</label>
                <input
                  id="graduationYear"
                  type="number"
                  className="form-control"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label htmlFor="skills">Professional Skills (comma separated)</label>
              <input
                id="skills"
                type="text"
                className="form-control"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Java, React, Python"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Updates
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Personal Details */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', marginBottom: 16 }}>
                  <User size={18} className="text-primary" />
                  <span>Personal Details</span>
                </h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="profile-label">Full Name</span>
                    <span className="profile-value">{profile.name}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Email Address</span>
                    <span className="profile-value">{profile.email}</span>
                  </div>
                  <div className="profile-field" style={{ marginTop: 12 }}>
                    <span className="profile-label">Roll Number</span>
                    <span className="profile-value">{profile.rollNumber}</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

              {/* Academic Profile */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', marginBottom: 16 }}>
                  <BookOpen size={18} className="text-primary" />
                  <span>Academic Qualifications</span>
                </h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="profile-label">Academic Branch</span>
                    <span className="profile-value">{profile.branch}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Cumulative CGPA</span>
                    <span className="profile-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'Not Specified'}
                    </span>
                  </div>
                  <div className="profile-field" style={{ marginTop: 12 }}>
                    <span className="profile-label">Active Backlogs</span>
                    <span className="profile-value" style={{ 
                      color: profile.backlogs > 0 ? 'var(--danger)' : 'var(--success)', 
                      fontWeight: 600 
                    }}>
                      {profile.backlogs}
                    </span>
                  </div>
                  <div className="profile-field" style={{ marginTop: 12 }}>
                    <span className="profile-label">Graduation Year</span>
                    <span className="profile-value">{profile.graduationYear}</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

              {/* Skills Area */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', marginBottom: 8 }}>
                  <Award size={18} className="text-primary" />
                  <span>Technical Skills</span>
                </h3>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="skills-tags">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    No skills listed. Click Edit Profile to add technical tags.
                  </span>
                )}
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

              {/* PDF Resume Management */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', marginBottom: 16 }}>
                  <FileText size={18} className="text-primary" />
                  <span>PDF Student Resume</span>
                </h3>

                <div style={{ background: 'var(--bg-body)', padding: 20, borderRadius: 10, border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {profile.resumeUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>✅ PDF Resume Uploaded</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your resume is attached and accessible to recruiters.</span>
                      </div>
                      <a 
                        href={`https://campus-placement-management-system-v6j0.onrender.com${profile.resumeUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <ExternalLink size={14} />
                        <span>View / Download PDF</span>
                      </a>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      No PDF resume uploaded yet. Upload your latest resume for recruiters.
                    </span>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Upload size={14} />
                      <span>{uploadingResume ? 'Uploading PDF...' : profile.resumeUrl ? 'Replace PDF Resume' : 'Upload PDF Resume'}</span>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleResumeUpload} 
                        style={{ display: 'none' }}
                        disabled={uploadingResume}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
