import React, { createContext, useState, useContext, useEffect } from 'react';
import authService, { 
  login as loginService, 
  register as registerService, 
  logout as logoutService, 
  getCurrentUser, 
  isAuthenticated, 
  updateProfile 
} from '../services/authService';
import { setupInterceptors } from '../utils/authTokenInterceptor';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set up interceptors when the app loads
  useEffect(() => {
    setupInterceptors();
  }, []);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
            setUserRole(userData.role);
            localStorage.setItem('userRole', userData.role); // Make sure role is available in localStorage
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      // Use the login service for real API call
      try {
        const response = await loginService(email, password);
        
        if (response && response.token) {
          // Get user data from response or localStorage
          const userData = getCurrentUser();
          
          if (userData) {
            // Make sure user role is set in localStorage
            localStorage.setItem('userRole', userData.role);
            
            setCurrentUser(userData);
            setUserRole(userData.role);
            
            // Make sure interceptors are set up
            setupInterceptors();
            
            return { success: true, userData };
          }
        }
        
        setError('Login failed: Invalid response from server');
        return { success: false, error: 'Invalid response from server' };
      } catch (apiError) {
        console.error('Login API error:', apiError);
        setError(apiError.response?.data?.message || 'Invalid email or password');
        return { success: false, error: apiError.response?.data?.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in');
      return { success: false, error: error.message || 'Failed to log in' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // Use the register service for real API call
      try {
        const response = await registerService(userData);
        
        if (response.data) {
          // Store user data in localStorage if not already done by service
          if (response.data.token && !localStorage.getItem('token')) {
            localStorage.setItem('token', response.data.token);
          }
          
          // Create complete user object from response and input data
          const user = {
            id: response.data.id,
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            role: response.data.role || 'TENANT',
            phoneNumber: userData.phoneNumber || response.data.phoneNumber || '',
            address: userData.address || response.data.address || '',
            profileImage: response.data.profileImage || '',
            city: userData.city || response.data.city || '',
            state: userData.state || response.data.state || '',
            zipCode: userData.zipCode || response.data.zipCode || ''
          };
          
          console.log('Storing complete user data after registration:', user);
          
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userRole', user.role);
          
          setCurrentUser(user);
          setUserRole(user.role);
          
          return { success: true, userData: user };
        }
        
        setError('Registration failed: Invalid response from server');
        return { success: false, error: 'Invalid response from server' };
      } catch (apiError) {
        console.error('Registration API error:', apiError);
        setError(apiError.response?.data?.message || 'Registration failed');
        return { success: false, error: apiError.response?.data?.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
      return { success: false, error: error.message || 'Failed to register' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call the logout service
      const result = await logoutService();
      
      // Always clear state and localStorage, even if the server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      setCurrentUser(null);
      setUserRole(null);
      setError('');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if there's an error, we still want to clear the client state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      setCurrentUser(null);
      setUserRole(null);
      
      return { success: true, clientSideOnly: true };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Updating user profile with data:', userData);
      
      // Call the profile update service
      try {
        const result = await updateProfile(userData);
        
        if (result && result.success) {
          // Get updated user data from result or service
          const updatedUser = result.data || result.user || getCurrentUser();
          
          // Make sure user data in localStorage is updated
          if (updatedUser) {
            const currentUserData = getCurrentUser();
            const newUserData = {
              ...currentUserData,
              firstName: updatedUser.firstName || currentUserData.firstName,
              lastName: updatedUser.lastName || currentUserData.lastName,
              // Use the values directly from the userData to ensure empty strings are properly handled
              phoneNumber: userData.phoneNumber !== undefined ? userData.phoneNumber : (updatedUser.phoneNumber || currentUserData.phoneNumber),
              address: userData.address !== undefined ? userData.address : (updatedUser.address || currentUserData.address),
              profileImage: updatedUser.profileImage || currentUserData.profileImage
            };
            
            console.log('Updating user data in context after API update:', newUserData);
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(newUserData));
            
            // Update context state
            setCurrentUser(newUserData);
            
            return { 
              success: true, 
              user: newUserData 
            };
          }
          
          // If no user data in result, refresh from localStorage
          const refreshedUser = getCurrentUser();
          setCurrentUser(refreshedUser);
          
          return { 
            success: true, 
            user: refreshedUser 
          };
        } else {
          setError(result?.error || 'Profile update failed');
          return { 
            success: false, 
            error: result?.error || 'Profile update failed' 
          };
        }
      } catch (apiError) {
        console.error('Profile update API error:', apiError);
        setError(apiError.message || 'Failed to update profile');
        return { 
          success: false, 
          error: apiError.message || 'Failed to update profile' 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!userRole) return false;
    return userRole === requiredRole;
  };

  // Check if user is a landlord
  const isLandlord = () => {
    return hasRole('LANDLORD');
  };

  // Check if user is a tenant
  const isTenant = () => {
    return hasRole('TENANT');
  };

  // Check if user is an admin
  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  // Check if user is authenticated
  const checkAuthenticated = () => {
    return isAuthenticated() && !!currentUser;
  };

  // The value to be provided in the context
  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    hasRole,
    isLandlord,            // Provide function reference
    isTenant,              // Provide function reference
    isAdmin,               // Provide function reference
    checkAuthenticated,    // Provide function reference
    isAuthenticated: checkAuthenticated, // Alias for backward compatibility
    getCurrentUser: () => currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 