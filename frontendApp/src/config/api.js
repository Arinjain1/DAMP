import axios from 'axios';

// Get API URL from environment variable
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for auth token
let authToken = null;

// Function to set auth token
export const setAuthToken = (token) => {
  authToken = token;
};

// Function to clear auth token
export const clearAuthToken = () => {
  authToken = null;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
};

// Dashboard API endpoints
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
};

// User API endpoints
export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

// Properties API endpoints
export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
};

// Customers API endpoints (clients in backend)
export const customersAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  updateStage: (id, status) => api.put(`/clients/${id}/stage`, { status }),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Deals API endpoints
export const dealsAPI = {
  getAll: () => api.get('/deals'),
  getById: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  delete: (id) => api.delete(`/deals/${id}`),
};

// Tasks/FollowUps API endpoints
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  toggleStatus: (id) => api.put(`/tasks/${id}/status`),
};

// Site Visits API endpoints
export const visitsAPI = {
  create: (data) => api.post('/visits', data),
  getById: (id) => api.get(`/visits/${id}`),
  submitFeedback: (itemId, data) => api.put(`/visits/item/${itemId}`, data),
};

export default api;
