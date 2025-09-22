import { axiosInstance } from './authService';

const maintenanceService = {
  // Get all maintenance requests (admin)
  getAllMaintenanceRequests: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/maintenance-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting all maintenance requests:', error);
      throw error;
    }
  },

  // Get maintenance requests by property (landlord)
  getMaintenanceRequestsByProperty: async (propertyId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/maintenance-requests/property/${propertyId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting maintenance requests by property:', error);
      throw error;
    }
  },

  // Get maintenance requests for landlord
  getLandlordMaintenanceRequests: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/landlord/maintenance-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting landlord maintenance requests:', error);
      throw error;
    }
  },

  // Get maintenance requests for tenant
  getTenantMaintenanceRequests: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/tenant/maintenance-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting tenant maintenance requests:', error);
      throw error;
    }
  },

  // Get maintenance request by ID
  getMaintenanceRequestById: async (id) => {
    try {
      const response = await axiosInstance.get(`/maintenance-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting maintenance request by ID:', error);
      throw error;
    }
  },

  // Create a maintenance request (tenant)
  createMaintenanceRequest: async (requestData, images = []) => {
    try {
      const formData = new FormData();
      
      // Add the request data as JSON string
      formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      
      // Add images if any
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image);
        });
      }
      
      const response = await axiosInstance.post('/tenant/maintenance-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  },

  // Update maintenance request status (landlord)
  updateMaintenanceRequestStatus: async (id, status, comment = '') => {
    try {
      const response = await axiosInstance.put(`/landlord/maintenance-requests/${id}/status`, {
        status,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance request status:', error);
      throw error;
    }
  },

  // Add comment to maintenance request
  addMaintenanceRequestComment: async (requestId, comment) => {
    try {
      const response = await axiosInstance.post(`/maintenance-requests/${requestId}/comments`, {
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding maintenance request comment:', error);
      throw error;
    }
  },

  // Upload maintenance request image
  uploadMaintenanceRequestImage: async (requestId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post(`/maintenance-requests/${requestId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading maintenance request image:', error);
      throw error;
    }
  },

  // Get maintenance request statistics (for landlord dashboard)
  getMaintenanceRequestStats: async () => {
    try {
      const response = await axiosInstance.get('/landlord/maintenance-requests/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting maintenance request stats:', error);
      throw error;
    }
  },

  // Get maintenance requests for tenant
  getTenantMaintenanceRequests: async () => {
    try {
      const response = await axiosInstance.get('/tenant/maintenance-requests');
      return response.data;
    } catch (error) {
      console.error('Error getting tenant maintenance requests:', error);
      throw error;
    }
  },

  // Get maintenance requests for landlord
  getLandlordMaintenanceRequests: async () => {
    try {
      const response = await axiosInstance.get('/landlord/maintenance-requests');
      return response.data;
    } catch (error) {
      console.error('Error getting landlord maintenance requests:', error);
      throw error;
    }
  }
};

export default maintenanceService; 