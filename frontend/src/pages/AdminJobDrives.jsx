import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X, Calendar, DollarSign, Award, Briefcase } from 'lucide-react';

const AdminJobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const branchesList = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const [formData, setFormData] = useState({
    companyId: '',
    role: '',
    jobDescription: '',
    packageCtc: '',
    minimumCgpa: '',
    allowedBacklogs: '0',
    graduationYear: '2026',
    applicationDeadline: '',
    driveDate: '',
    status: 'DRAFT',
    eligibleBranches: []
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchDrivesAndCompanies = async () => {
    try {
      setLoading(true);
      const [drivesRes, companiesRes] = await Promise.all([
        API.get('/api/admin/jobs'),
        API.get('/api/admin/companies')
      ]);
      setDrives(drivesRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error('Error fetching drives/companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesAndCompanies();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDrive(null);
    setFormData({
      companyId: companies[0]?.id || '',
      role: '',
      jobDescription: '',
      packageCtc: '',
      minimumCgpa: '',
      allowedBacklogs: '0',
      graduationYear: '2026',
      applicationDeadline: '',
      driveDate: '',
      status: 'DRAFT',
      eligibleBranches: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (drive) => {
    setEditingDrive(drive);
    setFormData({
      companyId: drive.companyId || '',
      role: drive.role || '',
      jobDescription: drive.jobDescription || '',
      packageCtc: drive.packageCtc || '',
      minimumCgpa: drive.minimumCgpa || '',
      allowedBacklogs: drive.allowedBacklogs !== undefined ? drive.allowedBacklogs : '0',
      graduationYear: drive.graduationYear || '2026',
      applicationDeadline: drive.applicationDeadline || '',
      driveDate: drive.driveDate || '',
      status: drive.status || 'DRAFT',
      eligibleBranches: drive.eligibleBranches || []
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleBranchCheckboxChange = (branch) => {
    setFormData(prev => {
      const branches = [...prev.eligibleBranches];
      if (branches.includes(branch)) {
        return { ...prev, eligibleBranches: branches.filter(b => b !== branch) };
      } else {
        return { ...prev, eligibleBranches: [...branches, branch] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast.error('Please select a company.');
      return;
    }
    if (formData.eligibleBranches.length === 0) {
      toast.error('Please check at least one eligible branch.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        companyId: parseInt(formData.companyId),
        role: formData.role,
        jobDescription: formData.jobDescription,
        packageCtc: parseFloat(formData.packageCtc),
        minimumCgpa: parseFloat(formData.minimumCgpa),
        allowedBacklogs: parseInt(formData.allowedBacklogs),
        graduationYear: parseInt(formData.graduationYear),
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate,
        status: formData.status,
        eligibleBranches: formData.eligibleBranches
      };

      if (editingDrive) {
        await API.put(`/api/admin/jobs/${editingDrive.id}`, payload);
        toast.success('Placement drive updated successfully!');
      } else {
        await API.post('/api/admin/jobs', payload);
        toast.success('Placement drive created successfully!');
      }
      setIsModalOpen(false);
      fetchDrivesAndCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving placement drive.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement drive? All candidate submissions associated with this drive will be deleted.')) {
      return;
    }
    try {
      await API.delete(`/api/admin/jobs/${id}`);
      toast.success('Placement drive deleted successfully!');
      fetchDrivesAndCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting placement drive.');
    }
  };

  const filteredDrives = drives.filter(drive =>
    drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1>Placement Job Drives</h1>
          <span className="header-subtitle">Configure selection benchmarks, eligible degrees, target cohorts, and recruitment dates.</span>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenAddModal}
          disabled={companies.length === 0}
        >
          <Plus size={18} />
          <span>Create Drive</span>
        </button>
      </div>



      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card">
        {filteredDrives.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            {companies.length === 0 
              ? 'Please configure companies first before creating placement drives.' 
              : 'No placement drives configured. Click "Create Drive" above to add new drives.'}
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Company & Role</th>
                  <th>Salary package</th>
                  <th>Min CGPA</th>
                  <th>Allowed Backlogs</th>
                  <th>Target Cohort</th>
                  <th>Drive Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrives.map(drive => {
                  const packageLPA = drive.packageCtc 
                    ? (drive.packageCtc / 100000).toFixed(2) + ' LPA'
                    : 'N/A';
                  return (
                    <tr key={drive.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>#{drive.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{drive.role}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{drive.companyName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{packageLPA}</td>
                      <td style={{ fontWeight: 700 }}>{drive.minimumCgpa ? Number(drive.minimumCgpa).toFixed(2) : 'N/A'}</td>
                      <td>Max {drive.allowedBacklogs}</td>
                      <td>{drive.graduationYear} Cohort</td>
                      <td>{drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${
                          drive.status === 'ACTIVE' ? 'success' : 
                          drive.status === 'CLOSED' ? 'danger' : 'warning'
                        }`}>
                          {drive.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '6px' }}
                            onClick={() => handleOpenEditModal(drive)}
                            title="Edit Drive"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            style={{ padding: '6px' }}
                            onClick={() => handleDelete(drive.id)}
                            title="Delete Drive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDrive ? 'Modify Placement Drive' : 'Configure New Job Drive'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyId">Recruiter Company</label>
                    <select
                      id="companyId"
                      className="form-control"
                      value={formData.companyId}
                      onChange={handleChange}
                      required
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Job Position Role</label>
                    <input
                      id="role"
                      type="text"
                      className="form-control"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="jobDescription">Job Description / Responsibilities</label>
                  <textarea
                    id="jobDescription"
                    className="form-control"
                    rows="3"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    placeholder="Provide details about the placement scope, domains, tech stack..."
                    required
                  ></textarea>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="packageCtc">Annual CTC package (in INR)</label>
                    <input
                      id="packageCtc"
                      type="number"
                      className="form-control"
                      value={formData.packageCtc}
                      onChange={handleChange}
                      placeholder="e.g. 1200000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="minimumCgpa">Cut-off CGPA</label>
                    <input
                      id="minimumCgpa"
                      type="number"
                      step="0.01"
                      min="0.00"
                      max="10.00"
                      className="form-control"
                      value={formData.minimumCgpa}
                      onChange={handleChange}
                      placeholder="e.g. 7.50"
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="allowedBacklogs">Max Active Backlogs Allowed</label>
                    <input
                      id="allowedBacklogs"
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.allowedBacklogs}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Target Graduation Cohort</label>
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
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="applicationDeadline">Application Deadline Date</label>
                    <input
                      id="applicationDeadline"
                      type="date"
                      className="form-control"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="driveDate">Recruitment Evaluation Date</label>
                    <input
                      id="driveDate"
                      type="date"
                      className="form-control"
                      value={formData.driveDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Hiring Drive Status</label>
                  <select
                    id="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="DRAFT">DRAFT (Hidden from Students)</option>
                    <option value="ACTIVE">ACTIVE (Accepting Applications)</option>
                    <option value="CLOSED">CLOSED (Evaluation Terminated)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Eligible Major Branches</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: 8, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                    {branchesList.map(branch => (
                      <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={formData.eligibleBranches.includes(branch)}
                          onChange={() => handleBranchCheckboxChange(branch)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>{branch}</span>
                      </label>
                    ))}
                  </div>
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
                  {actionLoading ? 'Saving...' : editingDrive ? 'Save Updates' : 'Configure Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobDrives;
