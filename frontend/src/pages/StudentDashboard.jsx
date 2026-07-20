import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Award, 
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserCheck,
  Calendar,
  Megaphone,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDrives: 0,
    eligibleDrives: 0,
    appliedJobs: 0,
    interviews: 0,
    offers: 0
  });
  const [studentProfile, setStudentProfile] = useState(null);
  const [activeDrives, setActiveDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyStates, setApplyStates] = useState({});

  const [announcements, setAnnouncements] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, profileRes, drivesRes, appsRes, announcementsRes] = await Promise.all([
        API.get('/api/students/dashboard'),
        API.get('/api/students/me'),
        API.get('/api/jobs'),
        API.get('/api/applications/me'),
        API.get('/api/announcements')
      ]);
      setStats(statsRes.data);
      setStudentProfile(profileRes.data);
      setActiveDrives(drivesRes.data);
      setApplications(appsRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const evaluateEligibility = (drive) => {
    if (!studentProfile) return { eligible: false, reasons: ['Loading academic details...'] };
    
    const reasons = [];
    const cgpaPassed = studentProfile.cgpa !== null && drive.minimumCgpa !== null && Number(studentProfile.cgpa) >= Number(drive.minimumCgpa);
    if (!cgpaPassed) {
      reasons.push(`Minimum CGPA required is ${drive.minimumCgpa}. Your CGPA is ${studentProfile.cgpa}.`);
    }

    const backlogPassed = studentProfile.backlogs !== null && drive.allowedBacklogs !== null && Number(studentProfile.backlogs) <= Number(drive.allowedBacklogs);
    if (!backlogPassed) {
      reasons.push(`Allowed backlogs is max ${drive.allowedBacklogs}. You have ${studentProfile.backlogs}.`);
    }

    const branchPassed = studentProfile.branch && drive.eligibleBranches && drive.eligibleBranches.includes(studentProfile.branch);
    if (!branchPassed) {
      reasons.push(`${studentProfile.branch} is not listed in eligible branches.`);
    }

    const gradPassed = studentProfile.graduationYear && drive.graduationYear && Number(studentProfile.graduationYear) === Number(drive.graduationYear);
    if (!gradPassed) {
      reasons.push(`Graduation year must be ${drive.graduationYear}. Yours is ${studentProfile.graduationYear}.`);
    }

    return {
      eligible: cgpaPassed && backlogPassed && branchPassed && gradPassed,
      reasons
    };
  };

  const hasApplied = (driveId) => {
    return applications.some(app => app.jobId === driveId);
  };

  const handleApply = async (driveId) => {
    setApplyStates(prev => ({ ...prev, [driveId]: true }));
    try {
      await API.post('/api/applications', { jobId: driveId });
      toast.success('Successfully applied for job drive!');
      const [statsRes, appsRes] = await Promise.all([
        API.get('/api/students/dashboard'),
        API.get('/api/applications/me')
      ]);
      setStats(statsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error applying for job drive.');
    } finally {
      setApplyStates(prev => ({ ...prev, [driveId]: false }));
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this job application?')) return;
    try {
      await API.delete(`/api/applications/${appId}`);
      toast.success('Application withdrawn successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error withdrawing application.');
    }
  };

  // Profile completion calculator
  const calculateProfileCompletion = () => {
    if (!studentProfile) return 0;
    let points = 0;
    if (studentProfile.name) points += 15;
    if (studentProfile.email) points += 15;
    if (studentProfile.rollNumber) points += 15;
    if (studentProfile.branch) points += 15;
    if (studentProfile.cgpa && Number(studentProfile.cgpa) > 0) points += 15;
    if (studentProfile.graduationYear) points += 15;
    if (studentProfile.skills && studentProfile.skills.length > 0) points += 10;
    return points;
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 300 }}></div>
        <div className="dashboard-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
        <div className="skeleton" style={{ height: 300 }}></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>Welcome, {user?.name}!</h1>
          <span className="header-subtitle">Your Career Dashboard &bull; Check active hiring drives and track recruitment.</span>
        </div>
      </div>

      {/* Campus Announcements / Notice Board Banner */}
      {announcements.length > 0 && (
        <motion.div 
          className="content-card" 
          style={{ marginBottom: 24, borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to right, #eff6ff, #ffffff)' }}
          variants={itemVariants}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Megaphone size={20} className="text-primary" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Campus Placement Notice Board</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {announcements.slice(0, 3).map(item => (
              <div key={item.id} style={{ padding: '8px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--primary)' }}>[{item.category}] {item.title}:</strong> {item.content}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid Counters */}
      <div className="dashboard-grid">
        <motion.div className="stats-card card-primary" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Hiring Drives</span>
            <span className="stats-value">{stats.totalDrives}</span>
          </div>
          <div className="stats-icon-box">
            <Briefcase size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-info" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Eligible Roles</span>
            <span className="stats-value">{stats.eligibleDrives}</span>
          </div>
          <div className="stats-icon-box">
            <UserCheck size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-warning" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">My Applications</span>
            <span className="stats-value">{stats.appliedJobs}</span>
          </div>
          <div className="stats-icon-box">
            <Clock size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-success" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Job Offers</span>
            <span className="stats-value">{stats.offers}</span>
          </div>
          <div className="stats-icon-box">
            <Award size={22} />
          </div>
        </motion.div>
      </div>

      <div className="content-grid">
        {/* Active Drives Panel */}
        <motion.div className="content-card" variants={itemVariants}>
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Latest Placement Drives</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Open positions targeting your graduation cohort.</span>
            </div>
            <Link to="/drives" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <span>Browse All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {activeDrives.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No open drives currently accepting applications.
            </div>
          ) : (
            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Salary Package</th>
                    <th>Auto Eligibility</th>
                    <th>Quick Apply</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDrives.slice(0, 5).map(drive => {
                    const { eligible, reasons } = evaluateEligibility(drive);
                    const applied = hasApplied(drive.id);
                    const packageLPA = drive.packageCtc 
                      ? (drive.packageCtc / 100000).toFixed(2) + ' LPA'
                      : 'Not Disclosed';

                    return (
                      <tr key={drive.id}>
                        <td style={{ fontWeight: 700 }}>{drive.companyName}</td>
                        <td style={{ fontWeight: 600 }}>{drive.role}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{packageLPA}</td>
                        <td>
                          {eligible ? (
                            <span className="badge badge-success">✓ Eligible</span>
                          ) : (
                            <span 
                              className="badge badge-danger" 
                              title={reasons.join('\n')}
                              style={{ cursor: 'help' }}
                            >
                              ✗ Ineligible
                            </span>
                          )}
                        </td>
                        <td>
                          {applied ? (
                            <span className="badge badge-primary">Applied</span>
                          ) : !eligible ? (
                            <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }} disabled>Locked</button>
                          ) : (
                            <motion.button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleApply(drive.id)}
                              disabled={applyStates[drive.id]}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {applyStates[drive.id] ? 'Applying...' : 'Apply'}
                            </motion.button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Profile Completion and Activity Side Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Profile Completion Circle */}
          <motion.div className="content-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} variants={itemVariants}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>Profile Completion</h3>
            
            {/* SVG Circle indicator */}
            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
              <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                <circle 
                  cx={60} 
                  cy={60} 
                  r={50} 
                  stroke="#e2e8f0" 
                  strokeWidth={8} 
                  fill="transparent" 
                />
                <motion.circle 
                  cx={60} 
                  cy={60} 
                  r={50} 
                  stroke="var(--primary)" 
                  strokeWidth={8} 
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - profileCompletion / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800 }}>{profileCompletion}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 16 }}>
              {profileCompletion < 100 
                ? 'Update academic credentials or list skills to reach 100% and unlock job matches.' 
                : 'Your placement profile is fully complete! Keep applying.'}
            </p>
            {profileCompletion < 100 && (
              <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%' }}>
                Complete Profile
              </Link>
            )}
          </motion.div>

          {/* Activity Panel */}
          <motion.div className="content-card" style={{ margin: 0 }} variants={itemVariants}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Recent Placements</h3>
            {applications.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                No active hiring workflows yet. Apply to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {applications.slice(0, 3).map(app => (
                  <div 
                    key={app.id} 
                    style={{ 
                      padding: '12px 14px', 
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.companyName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.role}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`badge badge-${app.status === 'SELECTED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                        {app.status}
                      </span>
                      {app.status === 'APPLIED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => handleWithdraw(app.id)}
                          title="Withdraw Application"
                        >
                          <XCircle size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
