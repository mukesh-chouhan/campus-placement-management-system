import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import API, { clearAuthSession } from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // 14-Minute Warning & 15-Minute Expiration Modal States
  const [sessionExpiringModalOpen, setSessionExpiringModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, [token]);

  // 15-Minute Inactivity Tracker (14-min Warning + 15-min Forced Logout)
  useEffect(() => {
    if (!token) return;

    const INACTIVITY_WARNING_MS = 14 * 60 * 1000; // 14 Minutes
    const TOTAL_INACTIVITY_MS = 15 * 60 * 1000; // 15 Minutes

    const resetInactivityTimers = () => {
      // If modal is open, user activity automatically stays logged in & resets modal
      lastActivityRef.current = Date.now();
      
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      setSessionExpiringModalOpen(false);
      setRemainingSeconds(60);

      // Schedule 14-minute warning
      warningTimerRef.current = setTimeout(() => {
        setSessionExpiringModalOpen(true);
        setRemainingSeconds(60);

        // Start 60-second countdown tick
        countdownIntervalRef.current = setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              handleInactivityLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_WARNING_MS);

      // Schedule 15-minute hard logout
      logoutTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, TOTAL_INACTIVITY_MS);
    };

    const handleInactivityLogout = () => {
      logout('Your session has expired due to inactivity. Please log in again.');
    };

    // User activity listeners
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown', 'focus'];
    
    // Throttled activity handler to prevent excessive re-renders
    let throttleTimeout = null;
    const onUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          // Only reset if warning modal is not actively prompting, or reset if active
          if (!sessionExpiringModalOpen) {
            resetInactivityTimers();
          }
        }, 500);
      }
    };

    activityEvents.forEach(evt => window.addEventListener(evt, onUserActivity));
    resetInactivityTimers();

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      activityEvents.forEach(evt => window.removeEventListener(evt, onUserActivity));
    };
  }, [token]);

  const stayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    setSessionExpiringModalOpen(false);
    setRemainingSeconds(60);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token: jwtToken, role, name, email: userEmail } = response.data;
      
      // Store in sessionStorage so closing tab/browser ends the session immediately
      sessionStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const register = async (studentData) => {
    try {
      const response = await API.post('/api/auth/register', studentData);
      const { token: jwtToken, role, name, email: userEmail } = response.data;
      
      sessionStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = (message = null) => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setSessionExpiringModalOpen(false);
    if (message) {
      toast.error(message);
    }
  };

  const updateLocalUser = (updatedProfile) => {
    const updated = { ...user, name: updatedProfile.name, email: updatedProfile.email };
    sessionStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateLocalUser,
    stayLoggedIn,
    sessionExpiringModalOpen,
    remainingSeconds,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
