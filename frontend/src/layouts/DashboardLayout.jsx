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
  Megaphone,
  ChevronDown,
  Clock
} from 'lucide-react';
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { user, logout, isAdmin, isStudent, stayLoggedIn, sessionExpiringModalOpen, remainingSeconds } = useAuth();
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

  // Profile Dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isStudent) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header Bar (Fixed at top on screens < 992px) */}
      <header className="mobile-header-bar">
        <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} title="Go to Dashboard">
          <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: '0.9rem', borderRadius: 5 }}>P</div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>PLACEHUB</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Theme switcher */}
          <button onClick={toggleTheme} className="theme-toggle-btn" style={{ padding: 6 }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Search Trigger */}
          <button onClick={() => setSearchOpen(true)} className="theme-toggle-btn" style={{ padding: 6 }} title="Search Workspace">
            <Search size={18} />
          </button>

          {/* Notifications */}
          <div className="notif-wrapper">
            <button onClick={() => setNotifOpen(!notifOpen)} className="notif-btn" style={{ padding: 6 }}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge" />}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="notification-dropdown"
                  style={{ right: -40, width: 280 }}
                >
                  <div className="notif-header">
                    <span className="notif-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="notif-mark-btn">Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`notif-item ${notif.read ? "" : "unread"}`}>
                        <span className="notif-text">{notif.text}</span>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', padding: 6 }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Sidebar Backdrop Overlay (Mobile & Tablet) */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? "show" : ""}`} 
        onClick={() => setMobileMenuOpen(false)} 
      />

      {/* Main Sidebar (Desktop / Collapsible Mobile Drawer) */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "show" : ""}`}>
        <div className="sidebar-brand" onClick={() => { handleLogoClick(); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }} title="Go to Dashboard">
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
          <button className="btn-logout" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
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

            {/* Interactive User Profile Header Dropdown */}
            <div className="profile-wrapper" ref={profileRef}>
              <div 
                className="user-header" 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="User Profile & Settings"
              >
                <div className="user-header-avatar">
                  {getInitials(user?.name)}
                </div>
                <span className="header-username">
                  {user?.name}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="profile-dropdown"
                  >
                    <div className="profile-dropdown-header">
                      <div className="user-header-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                        {getInitials(user?.name)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.name}
                        </span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 6px', alignSelf: 'flex-start', marginTop: 3 }}>
                          {user?.role}
                        </span>
                      </div>
                    </div>

                    <div className="profile-dropdown-menu">
                      <button 
                        className="profile-dropdown-item"
                        onClick={() => {
                          setProfileOpen(false);
                          if (isStudent) {
                            navigate('/profile');
                          } else {
                            navigate('/admin/students');
                          }
                        }}
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </button>

                      <button 
                        className="profile-dropdown-item text-danger"
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Session Expiring Warning Modal (14-minute inactivity prompt) */}
      <AnimatePresence>
        {sessionExpiringModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 4000, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 440, borderRadius: 12, padding: 24, textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px' }}>Session Expiring</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
                Your session will expire in <strong style={{ color: 'var(--danger)', fontSize: '1rem' }}>{remainingSeconds} seconds</strong> due to inactivity.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleLogout()}
                  style={{ flex: 1 }}
                >
                  Log Out Now
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={stayLoggedIn}
                  style={{ flex: 1 }}
                >
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
