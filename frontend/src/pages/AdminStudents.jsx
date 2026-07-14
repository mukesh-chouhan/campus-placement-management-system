import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { Search, Eye, X, BookOpen, Award, User } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [gradYearFilter, setGradYearFilter] = useState('ALL');

  const [selectedStudent, setSelectedStudent] = useState(null);

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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 700 }}>{student.rollNumber}</td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
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
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye size={14} />
                        <span>Profile</span>
                      </button>
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
    </div>
  );
};

export default AdminStudents;
