import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import API, { clearAuthSession } from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Enforce sessionStorage ONLY for token and user
  const [user, setUser] = useState(() => {
    // Purge legacy localStorage
    if (localStorage.getItem('user')) localStorage.removeItem('user');
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    // Purge legacy localStorage
    if (localStorage.getItem('token')) localStorage.removeItem('token');
    return sessionStorage.getItem('token');
  });

  const [loading, setLoading] = useState(true);

  // 14-Minute Warning & 15-Minute Expiration Modal States
  const [sessionExpiringModalOpen, setSessionExpiringModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Startup Token Expiration & Authentication Verification
  useEffect(() => {
    const initSession = () => {
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        try {
          // Decode JWT payload
          const base64Url = storedToken.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            
            // Check if JWT token has expired (payload.exp is in seconds)
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              console.warn('[Session] Startup check: JWT token has expired.');
              clearAuthSession();
              setToken(null);
              setUser(null);
              setLoading(false);
              return;
            }
          }
          API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (e) {
          console.error('[Session] Error parsing JWT token on startup:', e);
          clearAuthSession();
          setToken(null);
          setUser(null);
        }
      } else {
        clearAuthSession();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initSession();
  }, []);

  // Page Lifecycle API for Mobile (Android Chrome, iOS Safari, Background App Switching)
  useEffect(() => {
    if (!token) return;

    const MAX_BACKGROUND_MS = 15 * 60 * 1000; // 15 Minutes

    const checkBackgroundElapsedTime = () => {
      const bgTimeStr = sessionStorage.getItem('lastBackgroundTime');
      if (bgTimeStr) {
        const bgTime = Number(bgTimeStr);
        const elapsed = Date.now() - bgTime;
        sessionStorage.removeItem('lastBackgroundTime');

        if (elapsed >= MAX_BACKGROUND_MS) {
          console.warn(`[Mobile Session] Application was backgrounded for ${Math.round(elapsed / 1000)}s (>15m). Terminating session.`);
          logout('Your session expired while the application was inactive. Please log in again.');
          return true;
        }
      }
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('lastBackgroundTime', String(Date.now()));
      } else if (document.visibilityState === 'visible') {
        const expired = checkBackgroundElapsedTime();
        if (!expired) {
          resetInactivityTimers();
        }
      }
    };

    const handlePageHide = (e) => {
      sessionStorage.setItem('lastBackgroundTime', String(Date.now()));
    };

    const handlePageShow = (e) => {
      const expired = checkBackgroundElapsedTime();
      if (!expired) {
        resetInactivityTimers();
      }
    };

    // Mobile W3C Page Lifecycle API Events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('freeze', handlePageHide);
    window.addEventListener('resume', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('freeze', handlePageHide);
      window.removeEventListener('resume', handlePageShow);
    };
  }, [token]);

  // 15-Minute Inactivity Tracker (14-min Warning + 15-min Forced Logout)
  useEffect(() => {
    if (!token) return;

    const INACTIVITY_WARNING_MS = 14 * 60 * 1000; // 14 Minutes
    const TOTAL_INACTIVITY_MS = 15 * 60 * 1000; // 15 Minutes

    const resetInactivityTimers = () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      sessionStorage.setItem('lastActiveTime', String(Date.now()));
      setSessionExpiringModalOpen(false);
      setRemainingSeconds(60);

      // Schedule 14-minute warning modal
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

    // Desktop and Mobile Touch/Pointer events
    const activityEvents = [
      'touchstart', 'touchmove', 'touchend',
      'pointerdown', 'pointermove',
      'mousemove', 'keydown', 'click', 'scroll', 'focus'
    ];
    
    let throttleTimeout = null;
    const onUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          // Only reset if warning modal is not actively prompting
          if (!sessionExpiringModalOpen) {
            resetInactivityTimers();
          }
        }, 500);
      }
    };

    activityEvents.forEach(evt => window.addEventListener(evt, onUserActivity, { passive: true }));
    resetInactivityTimers();

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      activityEvents.forEach(evt => window.removeEventListener(evt, onUserActivity));
    };
  }, [token, sessionExpiringModalOpen]);

  const stayLoggedIn = () => {
    sessionStorage.setItem('lastActiveTime', String(Date.now()));
    setSessionExpiringModalOpen(false);
    setRemainingSeconds(60);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token: jwtToken, role, name, email: userEmail } = response.data;
      
      // Store STRICTLY in sessionStorage
      clearAuthSession();
      sessionStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('lastActiveTime', String(Date.now()));
      
      API.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
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
      
      clearAuthSession();
      sessionStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('lastActiveTime', String(Date.now()));
      
      API.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = (message = null) => {
    clearAuthSession();
    delete API.defaults.headers.common['Authorization'];
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
    isAuthenticated: !!user && !!token,
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
