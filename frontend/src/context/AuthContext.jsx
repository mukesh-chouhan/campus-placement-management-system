import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic verification on load
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, [token]);

  // 30-minute auto-logout on inactivity
  useEffect(() => {
    if (!token) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        alert('Session expired due to 30 minutes of inactivity. Please log in again.');
      }, INACTIVITY_LIMIT);
    };

    // Events that register user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token: jwtToken, role, name, email: userEmail } = response.data;
      
      localStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      localStorage.setItem('user', JSON.stringify(userData));
      
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
      
      localStorage.setItem('token', jwtToken);
      const userData = { name, email: userEmail, role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateLocalUser = (updatedProfile) => {
    const updated = { ...user, name: updatedProfile.name, email: updatedProfile.email };
    localStorage.setItem('user', JSON.stringify(updated));
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
