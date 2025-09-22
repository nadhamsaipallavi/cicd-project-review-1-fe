import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const normalizePath = (path) => {
  // If path already starts with /api, remove it
  if (path.startsWith('/api/')) {
    return path.substring(4); // Remove /api prefix
  }
  // If path starts with /, return it as is
  if (path.startsWith('/')) {
    return path;
  }
  // Otherwise, add / to the beginning
  return '/' + path;
};

// Override axios post, get, put, delete methods to normalize paths
const originalPost = axiosInstance.post;
axiosInstance.post = function(url, data, config) {
  return originalPost.call(this, normalizePath(url), data, config);
};

const originalGet = axiosInstance.get;
axiosInstance.get = function(url, config) {
  return originalGet.call(this, normalizePath(url), config);
};

const originalPut = axiosInstance.put;
axiosInstance.put = function(url, data, config) {
  return originalPut.call(this, normalizePath(url), data, config);
};

const originalDelete = axiosInstance.delete;
axiosInstance.delete = function(url, config) {
  return originalDelete.call(this, normalizePath(url), config);
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request:', token.substring(0, 20) + '...');
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for request to:', config.url);
    }
    
    // Log user role for debugging
    const userRole = localStorage.getItem('userRole');
    console.log('Current user role:', userRole);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle case where response doesn't exist (CORS error or network issue)
    if (!error.response) {
      console.error('Network error or CORS issue:', error.message);
      return Promise.reject(new Error('Network error or CORS issue. Please check if the backend server is running.'));
    }

    console.error('Response error:', error.response.status, error.response.data);

    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('Attempting to refresh token...');
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        localStorage.setItem('token', refreshResponse.data.token);
        console.log('Token refreshed successfully');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response.status === 403) {
      console.error('Access forbidden (403). User might not have the correct role or permissions.');
      const userStr = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      console.log('Current user data:', userStr);
      console.log('Current user role:', userRole);
      
      // Log more details about the request for debugging
      console.log('Request URL:', originalRequest?.url);
      console.log('Request method:', originalRequest?.method);
      
      // Check if token exists but was rejected
      if (localStorage.getItem('token')) {
        console.error('Token exists but access was denied. You may not have the right permissions.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 