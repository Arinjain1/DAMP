import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor to catch authentication errors (expired/invalid tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and user details to trigger direct login redirection
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setAuthHeader(null);
      
      // Reload window to trigger App component to show the login screen
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
