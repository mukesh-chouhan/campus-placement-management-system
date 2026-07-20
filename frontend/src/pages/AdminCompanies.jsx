import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X, Globe, MapPin, Download } from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // null means adding a new company

  const [formData, setFormData] = useState({
    companyName: '',
    location: '',
    website: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({ companyName: '', location: '', website: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || '',
      location: company.location || '',
      website: company.website || ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCompany) {
        // Edit Company
        await API.put(`/api/admin/companies/${editingCompany.id}`, formData);
        toast.success('Company updated successfully!');
      } else {
        // Add Company
        await API.post('/api/admin/companies', formData);
        toast.success('Company added successfully!');
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving company detail.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also remove associated job drives.')) {
      return;
    }
    try {
      await API.delete(`/api/admin/companies/${id}`);
      toast.success('Company deleted successfully!');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting company.');
    }
  };

  const exportCompaniesCSV = () => {
    if (companies.length === 0) {
      toast.error('No company data to export.');
      return;
    }
    const headers = ['Company ID', 'Company Name', 'Location', 'Website URL'];
    const rows = filteredCompanies.map(c => [
      c.id,
      `"${c.companyName || ''}"`,
      `"${c.location || ''}"`,
      `"${c.website || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Companies CSV exported successfully!');
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1>Recruiter Companies</h1>
          <span className="header-subtitle">Manage employer profiles, website URLs, and hiring hubs.</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportCompaniesCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Company</span>
          </button>
        </div>
      </div>



      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by company name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card">
        {filteredCompanies.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No companies configured. Click "Add Company" above to configure recruiter profiles.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Company ID</th>
                  <th>Company Name</th>
                  <th>Primary Hub / Location</th>
                  <th>Website URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(company => (
                  <tr key={company.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>#{company.id}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{company.companyName}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} className="text-light" />
                        <span>{company.location || 'N/A'}</span>
                      </span>
                    </td>
                    <td>
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Globe size={14} />
                          <span>{company.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px' }}
                          onClick={() => handleOpenEditModal(company)}
                          title="Edit Company"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '6px' }}
                          onClick={() => handleDelete(company.id)}
                          title="Delete Company"
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCompany ? 'Modify Recruiter Profile' : 'Configure New Recruiter'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Google India"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Primary Location Hub</label>
                  <input
                    id="location"
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website Link</label>
                  <input
                    id="website"
                    type="url"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="e.g. https://google.com"
                  />
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
                  {actionLoading ? 'Saving...' : editingCompany ? 'Save Updates' : 'Add Recruiter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
