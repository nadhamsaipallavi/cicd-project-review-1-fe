/**
 * Authentication Token Interceptor
 * 
 * This utility ensures that the authentication token is properly added to 
 * all outgoing API requests.
 */

import { axiosInstance } from '../services/authService';

// Set up request interceptor to add auth token to all requests
const setupInterceptors = () => {
  // Clear any existing interceptors
  if (axiosInstance.interceptors) {
    axiosInstance.interceptors.request.handlers = [];
  }

  // Add request interceptor to include the token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Make sure token is properly prefixed with "Bearer "
        config.headers.Authorization = token.startsWith('Bearer ') 
          ? token 
          : `Bearer ${token}`;
          
        console.log('Added authorization token to request:', config.url);
      } else {
        console.warn('No token found for request:', config.url);
      }
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
  
  // Log authentication issues
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 403) {
        console.error('Access denied (403):', {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          hasToken: !!error.config.headers.Authorization,
        });
      }
      return Promise.reject(error);
    }
  );
};

export { setupInterceptors }; 