import { axiosInstance } from './authService';

const leaseService = {
  // Get all leases (admin)
  getAllLeases: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/leases', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting all leases:', error);
      throw error;
    }
  },

  // Get leases by property (landlord)
  getLeasesByProperty: async (propertyId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/leases/property/${propertyId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting leases by property:', error);
      throw error;
    }
  },

  // Get leases for landlord
  getLandlordLeases: async (params = {}) => {
    try {
      console.log('Fetching landlord leases with params:', params);
      // Add a parameter to ensure we get full property and tenant details
      const enhancedParams = {
        ...params,
        includeDetails: true
      };
      const response = await axiosInstance.get('/landlord/leases', { params: enhancedParams });
      console.log('Landlord leases response:', response.data);
      
      // If the data is not in the expected format, try to normalize it
      let leases = response.data;
      
      // Ensure we return an array
      if (!Array.isArray(leases)) {
        if (leases && leases.content && Array.isArray(leases.content)) {
          leases = leases.content;
        } else {
          console.warn('Unexpected lease data format:', leases);
          leases = [];
        }
      }
      
      // Process each lease to ensure property and tenant information is available
      const processedLeases = leases.map(lease => {
        // Make sure we have a valid lease object
        if (!lease) return null;
        
        // Create a processed lease object
        const processedLease = { ...lease };
        
        // Ensure property information is available
        if (!processedLease.property && processedLease.propertyId) {
          // If we only have propertyId but no property object, create a placeholder
          processedLease.property = {
            id: processedLease.propertyId,
            title: processedLease.propertyTitle || processedLease.propertyName || 'Property #' + processedLease.propertyId
          };
        }
        
        // Ensure tenant information is available
        if (!processedLease.tenant && processedLease.tenantId) {
          // If we only have tenantId but no tenant object, create a placeholder
          processedLease.tenant = {
            id: processedLease.tenantId,
            firstName: processedLease.tenantFirstName || '',
            lastName: processedLease.tenantLastName || '',
            fullName: processedLease.tenantName || ''
          };
        }
        
        return processedLease;
      }).filter(lease => lease !== null); // Remove any null leases
      
      return processedLeases;
    } catch (error) {
      console.error('Error getting landlord leases:', error);
      throw error;
    }
  },

  // Get all leases for a tenant
  getTenantLeases: async (params = {}) => {
    try {
      console.log('Fetching all tenant leases with params:', params);
      const response = await axiosInstance.get('/tenant/leases', { params });
      console.log('Tenant leases response:', response.data);
      
      // Ensure we return an array
      let leases = response.data;
      if (!Array.isArray(leases)) {
        if (leases && leases.content && Array.isArray(leases.content)) {
          leases = leases.content;
        } else {
          console.warn('Unexpected lease data format:', leases);
          leases = [];
        }
      }
      
      // Process each lease to ensure property information is available
      const processedLeases = leases.map(lease => {
        // Make sure we have a valid lease object
        if (!lease) return null;
        
        // Create a processed lease object
        const processedLease = { ...lease };
        
        // Ensure property information is available
        if (!processedLease.property && processedLease.propertyId) {
          // If we only have propertyId but no property object, create a placeholder
          processedLease.property = {
            id: processedLease.propertyId,
            title: processedLease.propertyTitle || processedLease.propertyName || 'Property #' + processedLease.propertyId
          };
        }
        
        return processedLease;
      }).filter(lease => lease !== null); // Remove any null leases
      
      return processedLeases;
    } catch (error) {
      console.error('Error getting tenant leases:', error);
      throw error;
    }
  },

  // Get active lease for tenant with improved error handling
  getTenantLease: async () => {
    try {
      // Always get all leases for the tenant
      console.log('Fetching all tenant leases');
      const response = await axiosInstance.get('/tenant/leases');
      console.log('Tenant leases response:', response.data);
      
      // Return all leases instead of just one
      return response.data;
    } catch (error) {
      console.error('Error getting tenant leases:', error);
      
      // Try fallback to single lease endpoint
      try {
        console.log('Attempting fallback to single lease endpoint');
        const singleResponse = await axiosInstance.get('/tenant/lease');
        
        // If we got a single lease, wrap it in an array
        return [singleResponse.data];
      } catch (fallbackError) {
        console.error('Fallback to single lease also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  },

  // Get simplified tenant lease - just an active or any lease
  getSimplifiedTenantLease: async () => {
    try {
      // Try direct API call to backend
      // This is a simpler implementation that combines both endpoints
      console.log('Using simplified tenant lease fetch method');
      
      try {
        // Try to get all tenant leases first (more reliable)
        const allLeasesResponse = await axiosInstance.get('/tenant/leases');
        
        if (allLeasesResponse.data && allLeasesResponse.data.length > 0) {
          console.log('Found tenant leases, total count:', allLeasesResponse.data.length);
          
          // First try to find an ACTIVE lease
          const activeLease = allLeasesResponse.data.find(lease => lease.status === 'ACTIVE');
          
          if (activeLease) {
            console.log('Found active lease:', activeLease.id);
            return activeLease;
          }
          
          // If no active lease, return the first one (most recent)
          console.log('No active lease found, returning first lease');
          return allLeasesResponse.data[0];
        }
      } catch (error) {
        console.log('Error fetching tenant leases, trying singular endpoint as fallback');
        
        // Try the singular endpoint as a last resort
        try {
          const singleLeaseResponse = await axiosInstance.get('/tenant/lease');
          return singleLeaseResponse.data;
        } catch (innerError) {
          console.error('All lease fetch attempts failed');
          throw innerError;
        }
      }
      
      // If we got here with no lease, throw an error
      throw new Error('No leases found for tenant');
    } catch (error) {
      console.error('Error in simplified tenant lease fetch:', error);
      throw error;
    }
  },

  // Get all tenant leases
  getAllTenantLeases: async () => {
    try {
      const response = await axiosInstance.get('/tenant/leases');
      return response.data;
    } catch (error) {
      console.error('Error getting all tenant leases:', error);
      throw error;
    }
  },

  // Get landlord lease by ID
  getLandlordLeaseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/landlord/leases/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting landlord lease by ID ${id}:`, error);
      throw error;
    }
  },

  // Get lease by ID
  getLeaseById: async (id) => {
    try {
      // Check user role to determine the correct endpoint
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'LANDLORD') {
        return leaseService.getLandlordLeaseById(id);
      } else {
        const response = await axiosInstance.get(`/leases/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error getting lease by ID:', error);
      throw error;
    }
  },

  // Create a new lease (landlord or tenant)
  createLease: async (leaseData) => {
    try {
      // Check if this is a tenant or landlord call based on the role in localStorage
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'TENANT') {
        // Tenant is creating a lease request
        return leaseService.createTenantLease(leaseData);
      } else {
        // Landlord or admin is creating a lease
        const response = await axiosInstance.post('/leases', leaseData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating lease:', error);
      throw error;
    }
  },

  // Create a lease request (specifically for tenants)
  createTenantLease: async (leaseData) => {
    try {
      console.log('Creating tenant lease with data:', leaseData);
      const response = await axiosInstance.post('/tenant/leases', leaseData);
      console.log('Tenant lease creation response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating tenant lease request:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update lease (landlord)
  updateLease: async (id, leaseData) => {
    try {
      const response = await axiosInstance.put(`/leases/${id}`, leaseData);
      return response.data;
    } catch (error) {
      console.error('Error updating lease:', error);
      throw error;
    }
  },

  // Update lease status (landlord)
  updateLeaseStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/leases/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating lease status:', error);
      throw error;
    }
  },

  // Terminate lease (landlord)
  terminateLease: async (id, terminationDate, reason) => {
    try {
      const response = await axiosInstance.put(`/leases/${id}/terminate`, {
        terminationDate,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error terminating lease:', error);
      throw error;
    }
  },

  // Renew lease (landlord)
  renewLease: async (id, startDate, endDate, monthlyRent) => {
    try {
      const response = await axiosInstance.put(`/leases/${id}/renew`, {
        startDate,
        endDate,
        monthlyRent
      });
      return response.data;
    } catch (error) {
      console.error('Error renewing lease:', error);
      throw error;
    }
  },

  // Get lease documents
  getLeaseDocuments: async (leaseId) => {
    try {
      const response = await axiosInstance.get(`/leases/${leaseId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error getting lease documents:', error);
      throw error;
    }
  },

  // Upload lease document
  uploadLeaseDocument: async (leaseId, file, documentType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      const response = await axiosInstance.post(`/leases/${leaseId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lease document:', error);
      throw error;
    }
  },

  // Get upcoming lease renewals (for landlord dashboard)
  getUpcomingLeaseRenewals: async (daysThreshold = 30, limit = 5) => {
    try {
      const response = await axiosInstance.get('/landlord/leases/upcoming-renewals', {
        params: { daysThreshold, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting upcoming lease renewals:', error);
      throw error;
    }
  },

  // Get expiring leases (for landlord dashboard)
  getExpiringLeases: async (daysThreshold = 30, limit = 5) => {
    try {
      const response = await axiosInstance.get('/landlord/leases/expiring', {
        params: { daysThreshold, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting expiring leases:', error);
      throw error;
    }
  }
};

// Extract functions for named exports
const getAllLeases = leaseService.getAllLeases;
const getLeasesByProperty = leaseService.getLeasesByProperty;
const getLandlordLeases = leaseService.getLandlordLeases;
const getTenantLease = leaseService.getTenantLease;
const getSimplifiedTenantLease = leaseService.getSimplifiedTenantLease;
const getAllTenantLeases = leaseService.getAllTenantLeases;
const getLandlordLeaseById = leaseService.getLandlordLeaseById;
// Add alias for backward compatibility
const getTenantLeases = getAllTenantLeases;
const getLeaseById = leaseService.getLeaseById;
const createLease = leaseService.createLease;
const createTenantLease = leaseService.createTenantLease;
const updateLease = leaseService.updateLease;
const updateLeaseStatus = leaseService.updateLeaseStatus;
const terminateLease = leaseService.terminateLease;
const renewLease = leaseService.renewLease;
const getLeaseDocuments = leaseService.getLeaseDocuments;
const uploadLeaseDocument = leaseService.uploadLeaseDocument;
const getUpcomingLeaseRenewals = leaseService.getUpcomingLeaseRenewals;
const getExpiringLeases = leaseService.getExpiringLeases;

export default leaseService;
export {
  getAllLeases,
  getLeasesByProperty,
  getLandlordLeases,
  getTenantLease,
  getSimplifiedTenantLease,
  getAllTenantLeases,
  getLandlordLeaseById,
  getTenantLeases, // Export the alias
  getLeaseById,
  createLease,
  createTenantLease,
  updateLease,
  updateLeaseStatus,
  terminateLease,
  renewLease,
  getLeaseDocuments,
  uploadLeaseDocument,
  getUpcomingLeaseRenewals,
  getExpiringLeases
}; 