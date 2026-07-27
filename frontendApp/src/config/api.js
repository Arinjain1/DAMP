import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Resolve the API URL dynamically
const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // If the env variable is present and is NOT using localhost, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  
  // Try to get host IP from Metro bundler (works for both emulator & physical devices on the same Wi-Fi)
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.2:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  
  // Fallback depending on whether we are on emulator or desktop browser
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();


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

// Store navigation reference for redirects
let navigationRef = null;
let unauthorizedCallback = null;
let subscriptionErrorCallback = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

export const setUnauthorizedCallback = (callback) => {
  unauthorizedCallback = callback;
};

export const setSubscriptionErrorCallback = (callback) => {
  subscriptionErrorCallback = callback;
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Check for authentication errors (401 Unauthorized or 403 Forbidden)
      if (error.response.status === 401 || error.response.status === 403) {
        // Distinguish subscription errors from auth token expiration errors
        const isSubscriptionError = error.response.data && (
          error.response.data.code === 'SUBSCRIPTION_EXPIRED' ||
          error.response.data.code === 'SUBSCRIPTION_MISSING'
        );

        if (isSubscriptionError) {
          if (subscriptionErrorCallback) {
            subscriptionErrorCallback();
          }
        } else {
          // Clear auth token
          clearAuthToken();

          // Invoke unauthorized callback if registered (e.g. to clear redux state)
          if (unauthorizedCallback) {
            unauthorizedCallback();
          }

          // Directly redirect to login page, no error shown for smooth UX
          if (navigationRef && navigationRef.replace) {
            navigationRef.replace('/login');
          }
        }
      } else {
        // Server responded with other error
        console.error('API Error:', error.response.data);
      }
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
  updateProperties: (id, data) => api.put(`/clients/${id}/properties`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Deals API endpoints
export const dealsAPI = {
  getAll: () => api.get('/clients/deals'),
  getById: (id) => api.get(`/clients/deal/${id}`),
  create: (data) => api.post('/clients/deal', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  delete: (id) => api.delete(`/deals/${id}`),
  updateStage: (id, outcome) => api.put(`/clients/deal/${id}/stage`, { outcome }),
  
  // Payment/Transaction endpoints
  getNegotiation: (dealId) => api.get(`/deals/${dealId}/negotiation`),
  updateNegotiation: (dealId, data) => api.put(`/deals/${dealId}/negotiation`, data),
  addTransaction: (dealId, data) => api.post(`/deals/${dealId}/transactions`, data),
  completeTransaction: (transactionId, data) => api.put(`/deals/transactions/${transactionId}/complete`, data),
  getHistory: (dealId) => api.get(`/deals/${dealId}/history`),
};

// Tasks/FollowUps API endpoints
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggleStatus: (id) => api.put(`/tasks/${id}/status`),
};

// Site Visits API endpoints
export const visitsAPI = {
  create: (data) => api.post('/visits', data),
  getById: (id) => api.get(`/visits/${id}`),
  submitFeedback: (itemId, data) => api.put(`/visits/item/${itemId}`, data),
};

// Collaboration API endpoints
export const collabAPI = {
  searchBrokers: (query) => api.get('/collab/search', { params: { q: query } }),
  sendRequest: (receiverId) => api.post('/collab/request', { receiver_id: receiverId }),
  getMyNetwork: () => api.get('/collab/network'),
};

export default api;
