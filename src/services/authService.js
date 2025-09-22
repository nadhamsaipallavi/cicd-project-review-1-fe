import axios from 'axios';

const API_URL = 'http://localhost:8085/api';

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        localStorage.setItem('token', refreshResponse.data.token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        // Store token with Bearer prefix if it doesn't already have it
        const token = response.data.token.startsWith('Bearer ') 
          ? response.data.token 
          : `Bearer ${response.data.token}`;
          
        localStorage.setItem('token', token);
        
        // Create a complete user object with all available fields
        const userData = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          role: response.data.role || 'TENANT',
          phoneNumber: response.data.phoneNumber || '',
          address: response.data.address || '',
          profileImage: response.data.profileImage || '',
          city: response.data.city || '',
          state: response.data.state || '',
          zipCode: response.data.zipCode || ''
        };
        
        // Store complete user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role);
        
        console.log('Auth token and user data stored successfully:', userData);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Registration response:', response.data);
      
      // If the registration response includes a token, store it
      if (response.data && response.data.token) {
        // Store token with Bearer prefix if it doesn't already have it
        const token = response.data.token.startsWith('Bearer ') 
          ? response.data.token 
          : `Bearer ${response.data.token}`;
          
        localStorage.setItem('token', token);
        
        // Create a complete user object with all fields
        const userToStore = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          role: response.data.role || 'TENANT',
          phoneNumber: userData.phoneNumber || response.data.phoneNumber || '',
          address: userData.address || response.data.address || '',
          profileImage: response.data.profileImage || '',
          city: userData.city || response.data.city || '',
          state: userData.state || response.data.state || '',
          zipCode: userData.zipCode || response.data.zipCode || ''
        };
        
        console.log('Storing user data after registration:', userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('userRole', userToStore.role);
        
        console.log('Auth token and user data stored successfully after registration');
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // First, remove local storage items regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Then attempt to call the server logout endpoint
      try {
        const response = await axios.post(`${API_URL}/auth/logout`, {}, { 
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        console.log('Logout successful on server:', response.data);
        return { success: true };
      } catch (serverError) {
        // Even if server logout fails, we consider the client-side logout successful
        console.warn('Server logout failed, but client-side logout completed:', serverError.message);
        return { success: true };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success because we've cleared local storage
      return { success: true };
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },

  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'ADMIN';
  },

  isLandlord: () => {
    const role = authService.getUserRole();
    return role === 'LANDLORD';
  },

  isTenant: () => {
    const role = authService.getUserRole();
    return role === 'TENANT';
  },

  getUserProfile: async () => {
    try {
      // First, try to get the current user data from localStorage
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not found in localStorage");
      }
      
      try {
        // Then try to get fresh data from the API
        const response = await axiosInstance.get(`${API_URL}/users/me`);
        console.log("API getUserProfile response:", response.data);
        
        // Update localStorage with latest data from API
        if (response.data) {
          const updatedUser = {
            ...currentUser,
            firstName: response.data.firstName || currentUser.firstName,
            lastName: response.data.lastName || currentUser.lastName,
            email: response.data.email || currentUser.email,
            phoneNumber: response.data.phoneNumber !== undefined ? response.data.phoneNumber : currentUser.phoneNumber,
            address: response.data.address !== undefined ? response.data.address : currentUser.address,
            profileImage: response.data.profileImage || currentUser.profileImage,
            role: response.data.role || currentUser.role
          };
          console.log("Updating local storage with API data:", updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return response.data;
        }
        
        // If response has no data, return the current user data
        return currentUser;
      } catch (apiError) {
        console.error("Error fetching user profile from API:", apiError);
        console.warn("Falling back to localStorage data");
        
        // In case of API error, return the cached data from localStorage
        return currentUser;
      }
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error("User ID not found");
      }
      
      console.log("Updating profile with data:", {
        ...profileData,
        profileImage: profileData.profileImage ? 
          (typeof profileData.profileImage === 'string' && profileData.profileImage.startsWith('data:image') ? 
            '[BASE64_IMAGE_DATA]' : profileData.profileImage) : undefined
      });
      
      // Convert profile data to FormData if there's an image
      let requestData = profileData;
      let headers = { 'Content-Type': 'application/json' };
      
      if (profileData.profileImage && typeof profileData.profileImage === 'string' && 
          profileData.profileImage.startsWith('data:image')) {
        // Using FormData for multipart/form-data submissions with images
        const formData = new FormData();
        
        // Append regular fields
        formData.append('firstName', profileData.firstName);
        formData.append('lastName', profileData.lastName);
        formData.append('phoneNumber', profileData.phoneNumber === undefined ? '' : profileData.phoneNumber);
        formData.append('address', profileData.address === undefined ? '' : profileData.address);
        
        // Create a Blob from the base64 string and append as a file
        const imageBlob = await fetch(profileData.profileImage).then(r => r.blob());
        formData.append('profileImage', imageBlob, 'profile-image.jpg');
        
        requestData = formData;
        headers = {}; // Let axios set the content type for FormData
      }
      
      // Send profile data to the API
      const response = await axiosInstance.post(
        `${API_URL}/users/${currentUser.id}/profile`, 
        requestData,
        { headers }
      );
      
      // Update stored user data if profile is updated
      if (response.data) {
        console.log("Profile updated successfully, received:", {
          ...response.data,
          profileImage: response.data.profileImage ? '[IMAGE_URL]' : null
        });
        
        const updatedUser = { 
          ...currentUser, 
          firstName: response.data.firstName || currentUser.firstName,
          lastName: response.data.lastName || currentUser.lastName,
          phoneNumber: response.data.phoneNumber, // Allow empty string
          address: response.data.address, // Allow empty string
          profileImage: response.data.profileImage || currentUser.profileImage
        };
        
        console.log("Updating localStorage with user data after API update:", updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: updatedUser
        };
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update profile"
      };
    }
  },

  // Update profile with avatar using FormData approach
  updateUserProfileWithAvatar: async (formData) => {
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error("User ID not found");
      }
      
      console.log("Updating profile with FormData");
      
      // Send FormData to the API
      const response = await axiosInstance.post(
        `${API_URL}/users/${currentUser.id}/profile`, 
        formData,
        { 
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update stored user data if profile is updated
      if (response.data) {
        console.log("Profile with avatar updated successfully, received:", response.data);
        
        const updatedUser = { 
          ...currentUser, 
          firstName: response.data.firstName || currentUser.firstName,
          lastName: response.data.lastName || currentUser.lastName,
          phoneNumber: response.data.phoneNumber || currentUser.phoneNumber,
          address: response.data.address || currentUser.address
        };
        
        // Handle profile image if it was updated
        if (response.data.profileImage) {
          updatedUser.profileImage = response.data.profileImage;
        }
        
        console.log("Updating localStorage with user data after avatar update:", updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: updatedUser
        };
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error updating profile with avatar:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update profile with avatar"
      };
    }
  },

  changePassword: async (passwordData) => {
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error("User ID not found");
      }

      console.log("Changing password for user ID:", currentUser.id);
      
      // The endpoint expects path parameters instead of a JSON body
      const response = await axiosInstance.put(
        `${API_URL}/users/${currentUser.id}/password`, 
        null, 
        { 
          params: {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
};

// Extract individual functions for named exports
const login = authService.login;
const register = authService.register;
const logout = authService.logout;
const getCurrentUser = authService.getCurrentUser;
const isAuthenticated = authService.isAuthenticated;
const getToken = authService.getToken;
const getUserRole = authService.getUserRole;
const isAdmin = authService.isAdmin;
const isLandlord = authService.isLandlord;
const isTenant = authService.isTenant;
const getUserProfile = authService.getUserProfile;
const updateProfile = authService.updateUserProfile;
const updateUserProfileWithAvatar = authService.updateUserProfileWithAvatar;
const changePassword = authService.changePassword;

// Export the axios instance for use in other services
export { axiosInstance };

export default authService;
export {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  getUserRole,
  isAdmin,
  isLandlord,
  isTenant,
  getUserProfile,
  updateProfile,
  updateUserProfileWithAvatar,
  changePassword
}; 