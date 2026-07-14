import React, { useState, useEffect } from 'react';
import API from '../api/api';
import CustomChart from '../components/CustomChart';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    applications: 0,
    selectedStudents: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [recentDrives, setRecentDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, drivesRes] = await Promise.all([
        API.get('/api/admin/dashboard/stats'),
        API.get('/api/admin/analytics'),
        API.get('/api/admin/jobs')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setRecentDrives(drivesRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

  const getPieData = () => {
    if (!analytics || !analytics.statusDistribution) return [];
    return Object.entries(analytics.statusDistribution).map(([key, val]) => ({
      name: key.replace('_', ' '),
      value: val
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="dashboard-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 300 }}></div>
          <div className="skeleton" style={{ height: 300 }}></div>
        </div>
      </div>
    );
  }

  // Motion animation parameters
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
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
          <h1>Placement Dashboard</h1>
          <span className="header-subtitle">Overview of campus drives, corporate tie-ups, and student metrics.</span>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="dashboard-grid">
        <motion.div className="stats-card card-primary" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Total Students</span>
            <span className="stats-value">{stats.totalStudents}</span>
          </div>
          <div className="stats-icon-box">
            <Users size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-info" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Tie-up Companies</span>
            <span className="stats-value">{stats.totalCompanies}</span>
          </div>
          <div className="stats-icon-box">
            <Building2 size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-warning" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Active Drives</span>
            <span className="stats-value">{stats.activeDrives}</span>
          </div>
          <div className="stats-icon-box">
            <Briefcase size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-success" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Students Placed</span>
            <span className="stats-value">{stats.selectedStudents}</span>
          </div>
          <div className="stats-icon-box">
            <Award size={22} />
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="content-grid" style={{ marginBottom: 32 }}>
        
        {/* Status Distribution Pie Chart */}
        <motion.div className="content-card" style={{ margin: 0 }} variants={itemVariants}>
          <h2 className="card-title">Application Status Distribution</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Proportion of candidates across hiring checkpoints.
          </span>
          <div style={{ width: '100%', height: 260, marginTop: 16 }}>
            {getPieData().length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '60px 0' }}>
                No active candidate workflows
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-md)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Recruiter Hiring Bar Chart */}
        <motion.div className="content-card" style={{ margin: 0 }} variants={itemVariants}>
          <h2 className="card-title">Offers Accepted by Recruiter</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total selections grouped by companies.
          </span>
          <CustomChart 
            data={analytics?.companyHiring || {}} 
            barColor="var(--success)"
          />
        </motion.div>

      </div>

      {/* Recents list */}
      <motion.div className="content-card" variants={itemVariants}>
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Recent Placement Drives</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Last configured company hiring drives.
            </span>
          </div>
          <Link to="/admin/drives" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span>Manage Drives</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentDrives.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No placement drives configured. Add companies and create drives to get started.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Role</th>
                  <th>Salary Package</th>
                  <th>Min CGPA</th>
                  <th>Cohort Year</th>
                  <th>Drive Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDrives.slice(0, 5).map(drive => {
                  const packageLPA = drive.packageCtc 
                    ? (drive.packageCtc / 100000).toFixed(2) + ' LPA'
                    : 'N/A';
                  return (
                    <tr key={drive.id}>
                      <td style={{ fontWeight: 700 }}>{drive.companyName}</td>
                      <td style={{ fontWeight: 600 }}>{drive.role}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{packageLPA}</td>
                      <td style={{ fontWeight: 700 }}>{drive.minimumCgpa ? Number(drive.minimumCgpa).toFixed(2) : 'N/A'}</td>
                      <td>{drive.graduationYear}</td>
                      <td>
                        <span className={`badge badge-${drive.status === 'ACTIVE' ? 'success' : drive.status === 'CLOSED' ? 'danger' : 'warning'}`}>
                          {drive.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
