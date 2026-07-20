import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { Search, Edit, X, Download, Star } from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status & Notes Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = [
    'APPLIED',
    'ONLINE_ASSESSMENT',
    'TECHNICAL_INTERVIEW',
    'HR_INTERVIEW',
    'SELECTED',
    'REJECTED'
  ];

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      const [appsRes, companiesRes] = await Promise.all([
        API.get('/api/admin/applications'),
        API.get('/api/admin/companies')
      ]);
      setApplications(appsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error('Error fetching applications admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRating(app.rating || 0);
    setAdminNotes(app.adminNotes || '');
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.put(`/api/admin/applications/${selectedApp.id}`, { 
        status: newStatus,
        rating,
        adminNotes
      });
      toast.success(`Application updated successfully!`);
      setIsModalOpen(false);
      // Refresh list
      const appsRes = await API.get('/api/admin/applications');
      setApplications(appsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating application.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportApplicationsCSV = () => {
    if (applications.length === 0) {
      toast.error('No application data to export.');
      return;
    }
    const headers = ['App ID', 'Student Name', 'Roll Number', 'Branch', 'CGPA', 'Company', 'Role', 'Package CTC', 'Status', 'Rating', 'Admin Notes', 'Applied Date'];
    const rows = filteredApps.map(a => [
      a.id,
      `"${a.studentName || ''}"`,
      `"${a.studentRollNumber || ''}"`,
      `"${a.studentBranch || ''}"`,
      a.studentCgpa || 0,
      `"${a.companyName || ''}"`,
      `"${a.role || ''}"`,
      a.packageCtc || 0,
      a.status,
      a.rating || 0,
      `"${a.adminNotes || ''}"`,
      `"${a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `applications_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications CSV exported successfully!');
  };

  // Filter application list
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentRollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter === 'ALL' || app.companyName === companyFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesCompany && matchesStatus;
  });

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
          <h1>Student Applications</h1>
          <span className="header-subtitle">Review incoming application profiles and progress candidates across recruitment milestones.</span>
        </div>
        <button className="btn btn-secondary" onClick={exportApplicationsCSV}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>



      {/* Filter panel */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student, ID roll, or job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="ALL">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.companyName}>{c.companyName}</option>
          ))}
        </select>

        <select
          className="select-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Applications Table Card */}
      <div className="content-card">
        {filteredApps.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No applications match your selection.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Student Details</th>
                  <th>Recruiter & Role</th>
                  <th>Salary package</th>
                  <th>Submission Date</th>
                  <th>Current status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => {
                  const packageLPA = app.packageCtc 
                    ? (app.packageCtc / 100000).toFixed(2) + ' LPA'
                    : 'N/A';
                  const appliedDate = app.appliedDate 
                    ? new Date(app.appliedDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>#{app.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{app.studentName}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {app.studentRollNumber} &bull; {app.studentBranch} &bull; CGPA: {app.studentCgpa ? Number(app.studentCgpa).toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{app.role}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{app.companyName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{packageLPA}</td>
                      <td>{appliedDate}</td>
                      <td>
                        <span className={`badge badge-${
                          app.status === 'SELECTED' ? 'success' : 
                          app.status === 'REJECTED' ? 'danger' : 
                          app.status === 'APPLIED' ? 'primary' : 'warning'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px' }}
                          onClick={() => handleOpenStatusModal(app)}
                          title="Transition Status"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transition & Edit Modal */}
      {isModalOpen && selectedApp && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Candidate Application</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, marginBottom: 20, fontSize: '0.9rem' }}>
                  <div style={{ marginBottom: 6 }}>Candidate: <strong>{selectedApp.studentName}</strong> ({selectedApp.studentRollNumber})</div>
                  <div>Recruiter Drive: <strong>{selectedApp.companyName} &bull; {selectedApp.role}</strong></div>
                </div>

                <div className="form-group">
                  <label htmlFor="newStatus">Recruitment Stage</label>
                  <select
                    id="newStatus"
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Candidate Evaluation Rating (1-5 Stars)</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        onClick={() => setRating(star)}
                      >
                        <Star size={24} fill={star <= rating ? '#eab308' : 'none'} color={star <= rating ? '#eab308' : '#94a3b8'} />
                      </button>
                    ))}
                    {rating > 0 && <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{rating} Stars</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="adminNotes">Admin Evaluation & Interview Notes</label>
                  <textarea
                    id="adminNotes"
                    className="form-control"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter private interview notes, technical score, or feedback..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
