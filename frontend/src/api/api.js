import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campus-placement-management-system-v6j0.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      // 401 Unauthorized or 403 Forbidden indicates expired token or unauthorized access
      if (status === 401 || status === 403) {
        console.warn(`[API Interceptor] Session unauthorized or expired (${status}). Clearing session and redirecting to login.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
