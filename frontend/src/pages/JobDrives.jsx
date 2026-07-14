import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  Globe, 
  Calendar, 
  Check, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL'); // ALL, ELIGIBLE, INELIGIBLE
  
  const [selectedDrive, setSelectedDrive] = useState(null); // for detail modal
  const [applyLoading, setApplyLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, drivesRes, appsRes] = await Promise.all([
        API.get('/api/students/me'),
        API.get('/api/jobs'),
        API.get('/api/applications/me')
      ]);
      setStudentProfile(profileRes.data);
      setDrives(drivesRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error('Error fetching job drives data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const evaluateEligibility = (drive) => {
    if (!studentProfile) return { eligible: false, reasons: ['Loading academic details...'], checks: {} };
    
    const reasons = [];
    const checks = {
      cgpa: studentProfile.cgpa !== null && drive.minimumCgpa !== null && Number(studentProfile.cgpa) >= Number(drive.minimumCgpa),
      backlogs: studentProfile.backlogs !== null && drive.allowedBacklogs !== null && Number(studentProfile.backlogs) <= Number(drive.allowedBacklogs),
      branch: studentProfile.branch && drive.eligibleBranches && drive.eligibleBranches.includes(studentProfile.branch),
      graduationYear: studentProfile.graduationYear && drive.graduationYear && Number(studentProfile.graduationYear) === Number(drive.graduationYear)
    };

    if (!checks.cgpa) {
      reasons.push(`CGPA is below the minimum required ${drive.minimumCgpa}. Yours is ${studentProfile.cgpa}.`);
    }
    if (!checks.backlogs) {
      reasons.push(`Backlogs exceed the maximum ${drive.allowedBacklogs} allowed. You have ${studentProfile.backlogs}.`);
    }
    if (!checks.branch) {
      reasons.push(`Your branch (${studentProfile.branch}) is not eligible.`);
    }
    if (!checks.graduationYear) {
      reasons.push(`Graduation cohort must be ${drive.graduationYear}. Yours is ${studentProfile.graduationYear}.`);
    }

    const eligible = checks.cgpa && checks.backlogs && checks.branch && checks.graduationYear;
    return { eligible, reasons, checks };
  };

  const hasApplied = (driveId) => {
    return applications.some(app => app.jobId === driveId);
  };

  const handleApply = async (driveId) => {
    setApplyLoading(true);
    try {
      await API.post('/api/applications', { jobId: driveId });
      const appsRes = await API.get('/api/applications/me');
      setApplications(appsRes.data);
      
      toast.success('Successfully applied to the placement drive!');
      // Close detail modal if open
      setSelectedDrive(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  // Filter logic
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase());

    const { eligible } = evaluateEligibility(drive);
    
    if (eligibilityFilter === 'ELIGIBLE') {
      return matchesSearch && eligible;
    } else if (eligibilityFilter === 'INELIGIBLE') {
      return matchesSearch && !eligible;
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 40, width: '100%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="skeleton" style={{ height: 200 }}></div>
          <div className="skeleton" style={{ height: 200 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>Hiring drives</h1>
          <span className="header-subtitle">Check eligibility requirements and apply for open company drives.</span>
        </div>
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

        <select
          className="select-filter"
          value={eligibilityFilter}
          onChange={(e) => setEligibilityFilter(e.target.value)}
        >
          <option value="ALL">All Drives</option>
          <option value="ELIGIBLE">Eligible Drives</option>
          <option value="INELIGIBLE">Ineligible Drives</option>
        </select>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="content-card" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          No recruitment drives match your selection.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredDrives.map(drive => {
            const { eligible, reasons } = evaluateEligibility(drive);
            const applied = hasApplied(drive.id);
            const packageLPA = drive.packageCtc 
              ? (drive.packageCtc / 100000).toFixed(2) + ' LPA'
              : 'Not Disclosed';

            return (
              <div 
                key={drive.id} 
                className="content-card" 
                style={{ 
                  margin: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{drive.role}</h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        {drive.companyName}
                      </span>
                    </div>
                    {eligible ? (
                      <span className="badge badge-success">Eligible</span>
                    ) : (
                      <span className="badge badge-danger">Ineligible</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={14} />
                      <span>{drive.companyLocation || 'Flexible'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={14} />
                      <span>Deadline: {drive.applicationDeadline ? new Date(drive.applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>PACKAGE</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{packageLPA}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => setSelectedDrive(drive)}
                  >
                    Details
                  </button>
                  {applied ? (
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
                      Applied
                    </button>
                  ) : !eligible ? (
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
                      Locked
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => handleApply(drive.id)}
                      disabled={applyLoading}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedDrive && (() => {
        const { eligible, reasons, checks } = evaluateEligibility(selectedDrive);
        const applied = hasApplied(selectedDrive.id);
        const packageLPA = selectedDrive.packageCtc 
          ? (selectedDrive.packageCtc / 100000).toFixed(2) + ' LPA'
          : 'Not Disclosed';

        return (
          <div className="modal-backdrop" onClick={() => setSelectedDrive(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{selectedDrive.role}</h3>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{selectedDrive.companyName}</span>
                </div>
                <button className="btn-close" onClick={() => setSelectedDrive(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                    <MapPin size={16} className="text-light" />
                    <span>{selectedDrive.companyLocation || 'Flexible'}</span>
                  </div>
                  {selectedDrive.companyWebsite && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                      <Globe size={16} className="text-light" />
                      <a href={selectedDrive.companyWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Job Description</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {selectedDrive.jobDescription || 'No description provided.'}
                  </p>
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', marginBottom: 20 }} />

                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Academic Eligibility Breakdown</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span>Minimum CGPA Required: <strong>{selectedDrive.minimumCgpa}</strong></span>
                      {checks.cgpa ? (
                        <span className="eligible-yes" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={16} /> Eligible ({studentProfile?.cgpa})
                        </span>
                      ) : (
                        <span className="eligible-no" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={16} /> Ineligible ({studentProfile?.cgpa})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span>Max Backlogs Allowed: <strong>{selectedDrive.allowedBacklogs}</strong></span>
                      {checks.backlogs ? (
                        <span className="eligible-yes" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={16} /> Eligible ({studentProfile?.backlogs})
                        </span>
                      ) : (
                        <span className="eligible-no" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={16} /> Ineligible ({studentProfile?.backlogs})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span>Graduation Cohort Required: <strong>{selectedDrive.graduationYear}</strong></span>
                      {checks.graduationYear ? (
                        <span className="eligible-yes" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={16} /> Eligible ({studentProfile?.graduationYear})
                        </span>
                      ) : (
                        <span className="eligible-no" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={16} /> Ineligible ({studentProfile?.graduationYear})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span>Eligible Majors: <strong>{selectedDrive.eligibleBranches?.join(', ')}</strong></span>
                      {checks.branch ? (
                        <span className="eligible-yes" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={16} /> Eligible
                        </span>
                      ) : (
                        <span className="eligible-no" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <X size={16} /> Ineligible
                        </span>
                      )}
                    </div>

                  </div>
                </div>

                {!eligible && reasons.length > 0 && (
                  <div className="reasons-banner">
                    <span className="reasons-title">Ineligibility Reasons:</span>
                    {reasons.map((reason, idx) => (
                      <span key={idx} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <div style={{ marginRight: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPENSATION</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{packageLPA}</span>
                </div>

                <button className="btn btn-secondary" onClick={() => setSelectedDrive(null)}>
                  Close
                </button>
                
                {applied ? (
                  <button className="btn btn-secondary" disabled>
                    Already Applied
                  </button>
                ) : !eligible ? (
                  <button className="btn btn-secondary" disabled>
                    Locked
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApply(selectedDrive.id)}
                    disabled={applyLoading}
                  >
                    {applyLoading ? 'Submitting...' : 'Apply For Role'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default JobDrives;
