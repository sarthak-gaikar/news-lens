import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
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

// Handle responses - REMOVE THE AUTO-REFRESH
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 errors, don't auto-refresh
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't auto-refresh, just let the app handle it
      console.log('Authentication failed. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;