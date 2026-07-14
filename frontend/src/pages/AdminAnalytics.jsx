import React, { useState, useEffect } from 'react';
import API from '../api/api';
import CustomChart from '../components/CustomChart';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  UserCheck, 
  UserMinus, 
  DollarSign, 
  PieChart as PieIcon
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading placement analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatLPA = (val) => {
    if (!val) return '0.00 LPA';
    return (val / 100000).toFixed(2) + ' LPA';
  };

  const getBranchData = () => {
    if (!analytics || !analytics.branchPlacement) return [];
    return Object.entries(analytics.branchPlacement).map(([key, val]) => ({
      name: key.split(' ').map(w => w[0]).join(''), // short code, e.g. CS, IT
      fullName: key,
      value: val
    }));
  };

  const getStatusData = () => {
    if (!analytics || !analytics.statusDistribution) return [];
    return Object.entries(analytics.statusDistribution).map(([key, val]) => ({
      name: key.replace('_', ' '),
      value: val
    }));
  };

  const getCompanyPieData = () => {
    if (!analytics || !analytics.companyHiring) return [];
    return Object.entries(analytics.companyHiring).map(([key, val]) => ({
      name: key,
      value: val
    }));
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

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
        <div className="skeleton" style={{ height: 350 }}></div>
      </div>
    );
  }

  // Animation configurations
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
          <h1>Placement Analytics</h1>
          <span className="header-subtitle">Performance tracking dashboard showing packages, branch hire statistics, and offer volumes.</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="dashboard-grid">
        <motion.div className="stats-card card-primary" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Placement Rate</span>
            <span className="stats-value">
              {analytics?.placementPercentage !== undefined ? `${analytics.placementPercentage}%` : '0.00%'}
            </span>
          </div>
          <div className="stats-icon-box">
            <TrendingUp size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-success" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Candidates Placed</span>
            <span className="stats-value">{analytics?.studentsPlaced || 0}</span>
          </div>
          <div className="stats-icon-box">
            <UserCheck size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-danger" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Remaining Candidates</span>
            <span className="stats-value">{analytics?.remainingStudents || 0}</span>
          </div>
          <div className="stats-icon-box">
            <UserMinus size={22} />
          </div>
        </motion.div>

        <motion.div className="stats-card card-info" variants={itemVariants}>
          <div className="stats-info">
            <span className="stats-label">Average CTC package</span>
            <span className="stats-value">{formatLPA(analytics?.averagePackage)}</span>
          </div>
          <div className="stats-icon-box">
            <DollarSign size={22} />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        
        {/* Branch placements bar chart */}
        <motion.div className="content-card" variants={itemVariants}>
          <h2 className="card-title">Branch-wise Placements</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Selections counts across academic majors.
          </span>
          <div style={{ width: '100%', height: 260, marginTop: 16 }}>
            {getBranchData().length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '60px 0' }}>
                No branch placements recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getBranchData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-heading)', fontSize: '0.82rem' }}
                    labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {getBranchData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Recruitment Pipeline Flow Area Chart */}
        <motion.div className="content-card" variants={itemVariants}>
          <h2 className="card-title">Recruitment Stage Funnel</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Candidate volumes moving through evaluation milestones.
          </span>
          <div style={{ width: '100%', height: 260, marginTop: 16 }}>
            {getStatusData().length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '60px 0' }}>
                No candidate evaluations active
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getStatusData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }} />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Hires Share Pie Chart */}
        <motion.div className="content-card" variants={itemVariants}>
          <h2 className="card-title">Companies Hiring Distribution</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Corporate share of student job selections.
          </span>
          <div style={{ width: '100%', height: 260, marginTop: 16 }}>
            {getCompanyPieData().length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '60px 0' }}>
                No placements recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCompanyPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getCompanyPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Highest Package Center Card */}
        <motion.div className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, margin: 0 }} variants={itemVariants}>
          <PieIcon size={44} className="text-primary" />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Highest CTC Package Offered</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Top placement compensation package achieved.
            </span>
          </div>
          <div style={{ 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            fontSize: '2rem', 
            fontWeight: 800, 
            padding: '16px 36px', 
            borderRadius: 16,
            boxShadow: 'var(--shadow-sm)',
            fontFamily: 'var(--font-heading)'
          }}>
            {formatLPA(analytics?.highestPackage)}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AdminAnalytics;
