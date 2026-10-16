import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: 'https://campus-placement-management-system-v6j0.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get active session token strictly from sessionStorage
const getAuthToken = () => {
  // Purge any legacy localStorage token for maximum security
  if (localStorage.getItem('token')) {
    localStorage.removeItem('token');
  }
  if (localStorage.getItem('user')) {
    localStorage.removeItem('user');
  }
  return sessionStorage.getItem('token');
};

// Helper to clear all session auth keys
export const clearAuthSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('lastActiveTime');
  sessionStorage.removeItem('lastBackgroundTime');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Request interceptor to add JWT token from sessionStorage
API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || '';

      // Skip session clearing for auth endpoints (login/register).
      // 403 on /api/auth/* is a role-mismatch business rejection, NOT a session expiry.
      const isAuthEndpoint = requestUrl.includes('/api/auth/');

      if ((status === 401 || status === 403) && !isAuthEndpoint) {
        console.warn(`[API Interceptor] Session unauthorized or expired (${status}). Clearing session and redirecting to login.`);
        clearAuthSession();
        if (!window.location.pathname.includes('/login')) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
