import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  FileSpreadsheet, 
  User, 
  BarChart3, 
  Users, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Megaphone
} from 'lucide-react';
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Google drive application updated to ONLINE_ASSESSMENT.", read: false, time: "2h ago" },
    { id: 2, text: "Your academic CGPA has been verified by the registrar.", read: false, time: "5h ago" },
    { id: 3, text: "New placement drive: Amazon Software Engineer (32.5 LPA).", read: true, time: "1d ago" },
    { id: 4, text: "Recruitment status: Priya Sharma selected at Microsoft.", read: true, time: "2d ago" }
  ]);
  const notifRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global Ctrl + K search hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearchNavigate = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const getSearchItems = () => {
    const studentRoutes = [
      { name: "My Career Dashboard", path: "/dashboard", description: "Overview of your application stats and eligible jobs" },
      { name: "Browse Job Placement Drives", path: "/drives", description: "View list of active companies, criteria & apply" },
      { name: "Track My Job Applications", path: "/applications", description: "Track evaluation progress and stage timeline" },
      { name: "Edit Academic Profile", path: "/profile", description: "Update CGPA, backlogs, resume & skills tags" }
    ];
    const adminRoutes = [
      { name: "Placement Analytics Dashboard", path: "/admin/dashboard", description: "Placement charts and overview KPIs" },
      { name: "Manage Recruiters & Companies", path: "/admin/companies", description: "CRUD recruiters, address records and profiles" },
      { name: "Configure Placement Drives", path: "/admin/drives", description: "Create job roles, cutoff benchmark requirements" },
      { name: "Candidate Hiring Workflows", path: "/admin/applications", description: "Review and transition candidate application stages" },
      { name: "Registered Students List", path: "/admin/students", description: "Inspect student profiles, transcripts and metrics" },
      { name: "Salary Packages Analytics & Trends", path: "/admin/analytics", description: "Hiring trends and salary distribution diagrams" }
    ];
    const routes = isStudent ? studentRoutes : adminRoutes;
    if (!searchQuery) return routes;
    return routes.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: '0.9rem', borderRadius: 5 }}>P</div>
          <span style={{ fontSize: '1rem', fontWeight: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}> </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main Sidebar (Desktop / Collapsible) */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "show" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">P</div>
          <span className="brand-text">PLACEHUB</span>
        </div>

        <nav className="sidebar-menu">
          {isStudent && (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Dashboard">
                <LayoutDashboard size={18} />
                <span className="menu-text">Dashboard</span>
              </NavLink>
              <NavLink to="/drives" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Placement Drives">
                <Briefcase size={18} />
                <span className="menu-text">Placement Drives</span>
              </NavLink>
              <NavLink to="/applications" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Applications">
                <FileSpreadsheet size={18} />
                <span className="menu-text">Applications</span>
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="My Profile">
                <User size={18} />
                <span className="menu-text">My Profile</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Dashboard">
                <LayoutDashboard size={18} />
                <span className="menu-text">Dashboard</span>
              </NavLink>
              <NavLink to="/admin/companies" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Companies">
                <Building2 size={18} />
                <span className="menu-text">Companies</span>
              </NavLink>
              <NavLink to="/admin/drives" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Job Drives">
                <Briefcase size={18} />
                <span className="menu-text">Job Drives</span>
              </NavLink>
              <NavLink to="/admin/applications" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Applications">
                <FileSpreadsheet size={18} />
                <span className="menu-text">Applications</span>
              </NavLink>
              <NavLink to="/admin/students" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Students">
                <Users size={18} />
                <span className="menu-text">Students</span>
              </NavLink>
              <NavLink to="/admin/announcements" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Announcements">
                <Megaphone size={18} />
                <span className="menu-text">Announcements</span>
              </NavLink>
              <NavLink to="/admin/analytics" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} title="Analytics">
                <BarChart3 size={18} />
                <span className="menu-text">Analytics</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar">
              {getInitials(user?.name)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container Layer (with top navigation header) */}
      <div className={`main-wrapper-container ${sidebarCollapsed ? "collapsed" : ""}`}>
        
        {/* Sticky Header Nav Bar */}
        <header className="sticky-header">
          
          {/* Header Left Actions */}
          <div className="header-left">
            {/* Sidebar toggle button (desktop) */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="desktop-sidebar-toggle"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Global Search Bar (Trigger) */}
            <div 
              onClick={() => setSearchOpen(true)}
              className="header-search-bar"
            >
              <Search size={14} />
              <span style={{ fontSize: '0.8rem', flex: 1, textAlign: 'left' }}>Search workspace...</span>
              <kbd className="header-search-kbd">Ctrl K</kbd>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="header-right">
            
            {/* Dark / Light Theme Toggle Switcher */}
            <button 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notification System */}
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="notif-btn"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-badge" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="notification-dropdown"
                  >
                    <div className="notif-header">
                      <span className="notif-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="notif-mark-btn">
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No notification messages.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id}
                            className={`notif-item ${notif.read ? "" : "unread"}`}
                          >
                            <span className="notif-text">
                              {notif.text}
                            </span>
                            <span className="notif-time">
                              {notif.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Academic User Tag */}
            <div className="user-header">
              <div className="user-header-avatar">
                {getInitials(user?.name)}
              </div>
              <span className="header-username">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Workspace Main Panel */}
        <main className="workspace">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Search Modal Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="modal-backdrop" onClick={() => setSearchOpen(false)} style={{ zIndex: 3000 }}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 500, borderRadius: 10, overflow: 'hidden', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Search workspace sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    flex: 1,
                    color: 'var(--text-main)',
                    backgroundColor: 'transparent'
                  }}
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto', padding: 8 }}>
                <span style={{
                  display: 'block',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  padding: '8px 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Workspace Pages</span>
                
                {getSearchItems().length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No matching workspace sections found.
                  </div>
                ) : (
                  getSearchItems().map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSearchNavigate(item.path)}
                      className="search-result-item"
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {item.description}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled styles for mobile views */}
      <style>{`
        @media (max-width: 992px) {
          .mobile-header-bar {
            display: flex !important;
          }
          .sticky-header {
            display: none !important;
          }
          .sidebar {
            transform: translateX(-100%);
            width: 280px !important;
          }
          .sidebar.show {
            transform: translateX(0);
          }
          .main-wrapper-container {
            margin-left: 0 !important;
            padding-top: 60px !important;
          }
          .workspace {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
