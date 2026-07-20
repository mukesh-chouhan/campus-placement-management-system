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
  AlertCircle,
  Sparkles
} from 'lucide-react';

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobMatches, setJobMatches] = useState({});
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

      try {
        const matchesRes = await API.get('/api/jobs/matches');
        setJobMatches(matchesRes.data || {});
      } catch (e) {}
    } catch (err) {
      console.error('Error fetching job drives data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateMatch = (drive) => {
    if (jobMatches[drive.id]) return jobMatches[drive.id];
    if (!studentProfile) return { matchPercentage: 50, matchTier: 'MODERATE', matchingSkills: [], missingSkills: [], aiRecommendations: [] };

    const studentSkills = new Set((studentProfile.skills || []).map(s => s.toLowerCase()));
    const driveRole = (drive.role || '').toLowerCase();
    const driveDesc = (drive.jobDescription || '').toLowerCase();

    let matches = [];
    let missing = [];

    ['java', 'python', 'react', 'sql', 'dsa', 'c++', 'spring boot', 'html', 'node.js', 'mysql', 'aws', 'docker'].forEach(skill => {
      if (driveRole.includes(skill) || driveDesc.includes(skill)) {
        if (studentSkills.has(skill)) {
          matches.push(skill.toUpperCase());
        } else {
          missing.push(skill.toUpperCase());
        }
      }
    });

    let score = 65;
    if (studentProfile.cgpa && drive.minimumCgpa && Number(studentProfile.cgpa) >= Number(drive.minimumCgpa)) score += 15;
    if (studentProfile.backlogs === 0) score += 10;
    if (matches.length > 0) score += Math.min(10, matches.length * 4);
    score = Math.min(98, Math.max(35, score));

    const tier = score >= 85 ? 'EXCELLENT' : score >= 70 ? 'STRONG' : score >= 50 ? 'MODERATE' : 'LOW';
    const recs = [];
    if (missing.length > 0) recs.push(`Add skills (${missing.slice(0, 3).join(', ')}) to your profile to boost your ATS match score.`);
    if (!studentProfile.resumeUrl) recs.push('Upload your PDF resume to complete candidate ATS evaluation.');
    if (recs.length === 0) recs.push('Your candidate profile matches this placement drive very well!');

    return { matchPercentage: score, matchTier: tier, matchingSkills: matches, missingSkills: missing, aiRecommendations: recs };
  };

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
            const matchInfo = calculateMatch(drive);
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {eligible ? (
                        <span className="badge badge-success">Eligible</span>
                      ) : (
                        <span className="badge badge-danger">Ineligible</span>
                      )}
                      <span className={`badge ${matchInfo.matchPercentage >= 80 ? 'badge-success' : matchInfo.matchPercentage >= 65 ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Sparkles size={10} />
                        <span>{matchInfo.matchPercentage}% Match</span>
                      </span>
                    </div>
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
        const matchInfo = calculateMatch(selectedDrive);
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

                {/* AI ATS Evaluator Panel */}
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', margin: 0 }}>
                      <Sparkles size={16} className="text-primary" />
                      <span>AI ATS Candidate Match Evaluation</span>
                    </h4>
                    <span className={`badge ${matchInfo.matchPercentage >= 80 ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {matchInfo.matchPercentage}% ({matchInfo.matchTier} MATCH)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ width: `${matchInfo.matchPercentage}%`, height: '100%', background: matchInfo.matchPercentage >= 80 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.5s ease' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8, fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--success)', display: 'block', marginBottom: 4 }}>✅ Matching Skills</span>
                      {matchInfo.matchingSkills && matchInfo.matchingSkills.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {matchInfo.matchingSkills.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{s}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None detected</span>
                      )}
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, color: '#d97706', display: 'block', marginBottom: 4 }}>⚡ Suggested Skills Gap</span>
                      {matchInfo.missingSkills && matchInfo.missingSkills.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {matchInfo.missingSkills.map((s, i) => (
                            <span key={i} className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{s}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No skill gaps</span>
                      )}
                    </div>
                  </div>

                  {matchInfo.aiRecommendations && matchInfo.aiRecommendations.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                      <strong>🤖 AI Advice:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {matchInfo.aiRecommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
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
