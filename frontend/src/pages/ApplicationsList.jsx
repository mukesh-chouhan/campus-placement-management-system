import React, { useState, useEffect } from 'react';
import API from '../api/api';
import StatusTimeline from '../components/StatusTimeline';
import toast from 'react-hot-toast';
import { Calendar, Briefcase, ChevronRight, X, Trash2 } from 'lucide-react';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // for tracking details modal

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/applications/me');
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDeleteApplication = async (appId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete your application for ${companyName}?`)) {
      return;
    }
    try {
      await API.delete(`/api/applications/${appId}`);
      toast.success('Application deleted successfully!');
      setApplications(prev => prev.filter(app => app.id !== appId));
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete application.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 300 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>My Applications</h1>
          <span className="header-subtitle">Track the status of your campus placement applications.</span>
        </div>
      </div>

      <div className="content-card">
        {applications.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't submitted any job applications yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Applied Role</th>
                  <th>Salary package</th>
                  <th>Submission Date</th>
                  <th>Status Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  const packageLPA = app.packageCtc 
                    ? (app.packageCtc / 100000).toFixed(2) + ' LPA'
                    : 'N/A';
                  const appliedDate = app.appliedDate 
                    ? new Date(app.appliedDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.companyName}</td>
                      <td>{app.role}</td>
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
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => setSelectedApp(app)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <span>Track</span>
                            <ChevronRight size={14} />
                          </button>
                          {app.status === 'SELECTED' || app.status === 'REJECTED' ? (
                            <button 
                              className="btn btn-secondary btn-sm" 
                              disabled
                              style={{ padding: '6px', opacity: 0.5, cursor: 'not-allowed' }}
                              title="Final decision reached - deletion disabled"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteApplication(app.id, app.companyName)}
                              style={{ padding: '6px' }}
                              title="Delete Application"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* Progress tracking modal */}
      {selectedApp && (
        <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Track Application</h3>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedApp.companyName} &bull; {selectedApp.role}
                </span>
              </div>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#f8fafc', padding: 16, borderRadius: 10, marginBottom: 24 }}>
                <Briefcase className="text-primary" size={20} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPENSATION</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {selectedApp.packageCtc ? (selectedApp.packageCtc / 100000).toFixed(2) + ' LPA' : 'N/A'}
                  </span>
                </div>
                <div style={{ width: 1, height: 30, backgroundColor: 'var(--border)', margin: '0 12px' }}></div>
                <Calendar className="text-primary" size={20} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUBMITTED ON</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {selectedApp.appliedDate ? new Date(selectedApp.appliedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Recruitment Flow Timeline</h4>
              
              <div style={{ padding: '8px 16px' }}>
                <StatusTimeline currentStatus={selectedApp.status} />
              </div>

              {selectedApp.status === 'REJECTED' && (
                <div className="reasons-banner" style={{ marginTop: 24 }}>
                  <span className="reasons-title">Application Status</span>
                  <span>We regret to inform you that your application has been rejected at this stage. Better luck in future drives!</span>
                </div>
              )}

              {selectedApp.status === 'SELECTED' && (
                <div className="reasons-banner" style={{ marginTop: 24, backgroundColor: 'var(--success-light)', border: '1px dashed var(--success)', color: '#065f46' }}>
                  <span className="reasons-title" style={{ color: '#065f46' }}>Congratulations!</span>
                  <span>You have successfully cleared all recruitment rounds and have been offered a position. Check your email for next steps.</span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {selectedApp.status !== 'SELECTED' && selectedApp.status !== 'REJECTED' ? (
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteApplication(selectedApp.id, selectedApp.companyName)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Trash2 size={16} />
                  <span>Delete Application</span>
                </button>
              ) : <div></div>}

              <button className="btn btn-primary" onClick={() => setSelectedApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
