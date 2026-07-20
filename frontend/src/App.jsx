import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import JobDrives from './pages/JobDrives';
import ApplicationsList from './pages/ApplicationsList';

import AdminDashboard from './pages/AdminDashboard';
import AdminCompanies from './pages/AdminCompanies';
import AdminJobDrives from './pages/AdminJobDrives';
import AdminApplications from './pages/AdminApplications';
import AdminStudents from './pages/AdminStudents';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminAnalytics from './pages/AdminAnalytics';
import ErrorPage from './pages/ErrorPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect role-violating users to their respective home dashboards
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

// Public Route Component (redirects logged-in users away from auth forms)
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

// Root Redirect component
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        className: 'placehub-toast',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border)'
        }
      }} />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Student Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RootRedirect />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="drives" element={<JobDrives />} />
            <Route path="applications" element={<ApplicationsList />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="drives" element={<AdminJobDrives />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
