import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { Search, Eye, X, BookOpen, Award, User, Plus, Edit, Trash2, ShieldAlert, Download, FileText } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [gradYearFilter, setGradYearFilter] = useState('ALL');

  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form Modal control
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // null means adding a new student
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'Computer Science',
    cgpa: '',
    backlogs: 0,
    graduationYear: new Date().getFullYear(),
    skills: '',
    password: '',
    confirmPassword: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      branch: 'Computer Science',
      cgpa: '',
      backlogs: 0,
      graduationYear: new Date().getFullYear(),
      skills: '',
      password: '',
      confirmPassword: ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      rollNumber: student.rollNumber || '',
      branch: student.branch || 'Computer Science',
      cgpa: student.cgpa || '',
      backlogs: student.backlogs ?? 0,
      graduationYear: student.graduationYear || new Date().getFullYear(),
      skills: student.skills ? student.skills.join(', ') : '',
      password: '',
      confirmPassword: ''
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : 0,
        backlogs: formData.backlogs ? parseInt(formData.backlogs) : 0,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : new Date().getFullYear(),
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      if (editingStudent) {
        // Edit student
        await API.put(`/api/admin/students/${editingStudent.id}`, payload);
        toast.success('Student updated successfully!');
      } else {
        // Add student (requires password validation)
        if (!formData.password) {
          toast.error('Password is required when creating a student.');
          setActionLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match.');
          setActionLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters.');
          setActionLoading(false);
          return;
        }
        
        await API.post('/api/admin/students', {
          ...payload,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        toast.success('Student created successfully!');
      }
      setIsFormModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}? This will also delete all of their job applications.`)) {
      return;
    }
    try {
      await API.delete(`/api/admin/students/${id}`);
      toast.success('Student deleted successfully!');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting student.');
    }
  };

  const handleToggleBlacklist = async (id, name, currentStatus) => {
    const actionText = currentStatus ? 'unblacklist' : 'blacklist';
    if (!window.confirm(`Are you sure you want to ${actionText} student ${name}?`)) {
      return;
    }
    try {
      await API.put(`/api/admin/students/${id}/blacklist`);
      toast.success(`Student ${name} ${actionText}ed successfully!`);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || `Error toggling blacklist status.`);
    }
  };

  const exportStudentsCSV = () => {
    if (students.length === 0) {
      toast.error('No student data to export.');
      return;
    }
    const headers = ['ID', 'Roll Number', 'Full Name', 'Email', 'Branch', 'CGPA', 'Backlogs', 'Graduation Year', 'Blacklisted', 'Skills'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.rollNumber || ''}"`,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.branch || ''}"`,
      s.cgpa || 0,
      s.backlogs || 0,
      s.graduationYear || '',
      s.isBlacklisted ? 'YES' : 'NO',
      `"${s.skills ? s.skills.join(', ') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Students CSV exported successfully!');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = branchFilter === 'ALL' || student.branch === branchFilter;
    const matchesGrad = gradYearFilter === 'ALL' || String(student.graduationYear) === gradYearFilter;

    return matchesSearch && matchesBranch && matchesGrad;
  });

  const getUniqueGradYears = () => {
    const years = students.map(s => s.graduationYear).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 350 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>Student Records</h1>
          <span className="header-subtitle">View profiles, cumulative CGPA, and backlog details for campus candidate verification.</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportStudentsCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="ALL">All Branches</option>
          {branches.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          className="select-filter"
          value={gradYearFilter}
          onChange={(e) => setGradYearFilter(e.target.value)}
        >
          <option value="ALL">All Cohort Years</option>
          {getUniqueGradYears().map(year => (
            <option key={year} value={String(year)}>{year}</option>
          ))}
        </select>
      </div>

      {/* Student List Table */}
      <div className="content-card">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No registered student records found matching filters.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Full Name</th>
                  <th>Branch</th>
                  <th>CGPA Score</th>
                  <th>Backlogs</th>
                  <th>Graduation Year</th>
                  <th>Resume (PDF)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 700 }}>{student.rollNumber}</td>
                    <td style={{ fontWeight: 600 }}>
                      {student.name}
                      {student.isBlacklisted && (
                        <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Blacklisted
                        </span>
                      )}
                    </td>
                    <td>{student.branch}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}
                    </td>
                    <td style={{ 
                      color: student.backlogs > 0 ? 'var(--danger)' : 'var(--success)',
                      fontWeight: 600 
                    }}>
                      {student.backlogs} active
                    </td>
                    <td>{student.graduationYear}</td>
                    <td>
                      {student.resumeUrl ? (
                        <a 
                          href={`https://campus-placement-management-system-v6j0.onrender.com${student.resumeUrl}`}
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          <FileText size={12} className="text-primary" />
                          <span>View PDF</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not Uploaded</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => setSelectedStudent(student)}
                          title="View Profile"
                        >
                          <Eye size={14} />
                          <span>Profile</span>
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px' }}
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className={`btn ${student.isBlacklisted ? 'btn-success' : 'btn-warning'} btn-sm`}
                          style={{ padding: '6px' }}
                          onClick={() => handleToggleBlacklist(student.id, student.name, student.isBlacklisted)}
                          title={student.isBlacklisted ? 'Unblacklist Student' : 'Blacklist Student'}
                        >
                          <ShieldAlert size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px' }}
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile Summary</h3>
              <button className="btn-close" onClick={() => setSelectedStudent(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Personal Info */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', marginBottom: 12 }}>
                    <User size={16} className="text-primary" />
                    <span>Personal Information</span>
                  </h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="profile-label">Student Name</span>
                      <span className="profile-value">{selectedStudent.name}</span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-label">Email Address</span>
                      <span className="profile-value">{selectedStudent.email}</span>
                    </div>
                    <div className="profile-field" style={{ marginTop: 12 }}>
                      <span className="profile-label">Roll Number</span>
                      <span className="profile-value">{selectedStudent.rollNumber}</span>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

                {/* Academic profile */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', marginBottom: 12 }}>
                    <BookOpen size={16} className="text-primary" />
                    <span>Academic Standing</span>
                  </h4>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="profile-label">Department Branch</span>
                      <span className="profile-value">{selectedStudent.branch}</span>
                    </div>
                    <div className="profile-field">
                      <span className="profile-label">Cumulative CGPA</span>
                      <span className="profile-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {selectedStudent.cgpa ? Number(selectedStudent.cgpa).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="profile-field" style={{ marginTop: 12 }}>
                      <span className="profile-label">Active Backlogs</span>
                      <span className="profile-value" style={{ 
                        color: selectedStudent.backlogs > 0 ? 'var(--danger)' : 'var(--success)',
                        fontWeight: 600
                      }}>
                        {selectedStudent.backlogs}
                      </span>
                    </div>
                    <div className="profile-field" style={{ marginTop: 12 }}>
                      <span className="profile-label">Graduation Year</span>
                      <span className="profile-value">{selectedStudent.graduationYear}</span>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

                {/* Skills tags */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', marginBottom: 8 }}>
                    <Award size={16} className="text-primary" />
                    <span>Technical Capabilities</span>
                  </h4>
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    <div className="skills-tags">
                      {selectedStudent.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No skills configured in candidate profile.
                    </span>
                  )}
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

                {/* PDF Resume Access */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', marginBottom: 12 }}>
                    <FileText size={16} className="text-primary" />
                    <span>Candidate PDF Resume</span>
                  </h4>
                  {selectedStudent.resumeUrl ? (
                    <a
                      href={`https://campus-placement-management-system-v6j0.onrender.com${selectedStudent.resumeUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <FileText size={14} />
                      <span>View / Download Resume (PDF)</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No PDF resume uploaded by candidate yet.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedStudent(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStudent ? 'Modify Student Record' : 'Configure New Student'}</h3>
              <button className="btn-close" onClick={() => setIsFormModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Rahul Sharma"
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
                      onChange={handleFormChange}
                      placeholder="e.g. rahul@placehub.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rollNumber">Roll Number</label>
                    <input
                      id="rollNumber"
                      type="text"
                      className="form-control"
                      value={formData.rollNumber}
                      onChange={handleFormChange}
                      placeholder="e.g. CS2023010"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="branch">Department Branch</label>
                    <select
                      id="branch"
                      className="form-control"
                      value={formData.branch}
                      onChange={handleFormChange}
                      required
                    >
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label htmlFor="cgpa">Cumulative CGPA</label>
                      <input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        className="form-control"
                        value={formData.cgpa}
                        onChange={handleFormChange}
                        placeholder="e.g. 8.50"
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
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Graduation Year</label>
                    <input
                      id="graduationYear"
                      type="number"
                      className="form-control"
                      value={formData.graduationYear}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="skills">Technical Capabilities (Comma-separated)</label>
                    <input
                      id="skills"
                      type="text"
                      className="form-control"
                      value={formData.skills}
                      onChange={handleFormChange}
                      placeholder="e.g. Java, React, SQL"
                    />
                  </div>

                  {!editingStudent && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                          id="password"
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleFormChange}
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
                          onChange={handleFormChange}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : editingStudent ? 'Save Updates' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
