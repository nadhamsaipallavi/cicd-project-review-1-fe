import { axiosInstance } from './authService';

const paymentService = {
  // Get all payments (admin)
  getAllPayments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by property (landlord)
  getPaymentsByProperty: async (propertyId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/payments/property/${propertyId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments for landlord
  getLandlordPayments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/landlord/payments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments for tenant
  getTenantPayments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/tenant/payments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming payments for tenant
  getUpcomingPaymentsForTenant: async () => {
    try {
      const response = await axiosInstance.get('/tenant/payments/upcoming');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Make a payment (tenant) with existing payment method or Razorpay
  makePayment: async (amount, description, leaseId, paymentMethodId, razorpayData = null) => {
    try {
      console.log('Making payment:', { amount, description, leaseId, razorpayData });
      
      const paymentData = {
        amount,
        description,
        leaseId
      };
      
      // If Razorpay data is provided, add it to the request
      if (razorpayData) {
        console.log('Including Razorpay payment data:', razorpayData);
        paymentData.razorpayPaymentId = razorpayData.razorpayPaymentId;
        paymentData.razorpayOrderId = razorpayData.razorpayOrderId || razorpayData.razorpay_order_id;
        paymentData.razorpaySignature = razorpayData.razorpaySignature || razorpayData.razorpay_signature;
        paymentData.paymentMethod = 'RAZORPAY';
        
        // Include property details if available
        if (razorpayData.propertyDetails) {
          console.log('Including property details:', razorpayData.propertyDetails);
          paymentData.propertyDetails = razorpayData.propertyDetails;
        }
      } 
      // If using an existing payment method
      else if (paymentMethodId) {
        paymentData.paymentMethodId = paymentMethodId;
      }
      
      console.log('Final payment request payload:', paymentData);
      const response = await axiosInstance.post('/tenant/payments', paymentData);
      console.log('Payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      throw error;
    }
  },

  // Make a payment with a new card
  makePaymentWithNewCard: async (amount, description, leaseId, cardDetails, saveCard = true) => {
    try {
      const response = await axiosInstance.post('/tenant/payments', {
        amount,
        description,
        leaseId,
        newCard: cardDetails,
        saveCard
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Razorpay order for lease payment
  createRazorpayOrder: async (amount, leaseId, description) => {
    try {
      console.log('Creating Razorpay order for lease payment:', { amount, leaseId, description });
      console.log('Making request to:', '/tenant/payments/razorpay/create-order');
      
      const requestData = {
        amount,
        leaseId,
        description
      };
      console.log('Request payload:', requestData);
      
      const response = await axiosInstance.post('/tenant/payments/razorpay/create-order', requestData);
      console.log('Razorpay order creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentId, orderId, signature, leaseId) => {
    try {
      console.log('Verifying Razorpay payment:', { paymentId, orderId, signature, leaseId });
      console.log('Making request to:', '/tenant/payments/razorpay/verify');
      
      const requestData = {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        leaseId
      };
      console.log('Request payload:', requestData);
      
      const response = await axiosInstance.post('/tenant/payments/razorpay/verify', requestData);
      console.log('Razorpay verification successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  // Record a payment (landlord)
  recordPayment: async (amount, description, leaseId, paymentMethod, paymentDate) => {
    try {
      const response = await axiosInstance.post('/landlord/payments/record', {
        amount,
        description,
        leaseId,
        paymentMethod,
        paymentDate
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment receipt
  getPaymentReceiptUrl: async (paymentId) => {
    try {
      // Return the URL directly for downloading the receipt
      return `${axiosInstance.defaults.baseURL}/payments/${paymentId}/receipt`;
    } catch (error) {
      throw error;
    }
  },

  // Get payment statistics for landlord
  getLandlordPaymentStats: async () => {
    try {
      const response = await axiosInstance.get('/landlord/payments/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent payments (for dashboard)
  getRecentPayments: async (limit = 5) => {
    try {
      const response = await axiosInstance.get('/payments/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate payment invoice
  generatePaymentInvoice: async (leaseId, amount, description, dueDate) => {
    try {
      const response = await axiosInstance.post(`/leases/${leaseId}/invoices`, {
        amount,
        description,
        dueDate
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment methods for tenant
  getTenantPaymentMethods: async () => {
    try {
      const response = await axiosInstance.get('/tenant/payment-methods');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add payment method for tenant
  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await axiosInstance.post('/tenant/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId) => {
    try {
      await axiosInstance.delete(`/tenant/payment-methods/${paymentMethodId}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (paymentMethodId) => {
    try {
      const response = await axiosInstance.put(`/tenant/payment-methods/${paymentMethodId}/default`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Extract functions for named exports
const getAllPayments = paymentService.getAllPayments;
const getPaymentsByProperty = paymentService.getPaymentsByProperty;
const getLandlordPayments = paymentService.getLandlordPayments;
const getTenantPayments = paymentService.getTenantPayments;
const getPaymentById = paymentService.getPaymentById;
const getUpcomingPaymentsForTenant = paymentService.getUpcomingPaymentsForTenant;
// Add this alias for backward compatibility
const getUpcomingPayments = paymentService.getUpcomingPaymentsForTenant;
const makePayment = paymentService.makePayment;
const makePaymentWithNewCard = paymentService.makePaymentWithNewCard;
const createRazorpayOrder = paymentService.createRazorpayOrder;
const verifyRazorpayPayment = paymentService.verifyRazorpayPayment;
const recordPayment = paymentService.recordPayment;
const getPaymentReceiptUrl = paymentService.getPaymentReceiptUrl;
const getLandlordPaymentStats = paymentService.getLandlordPaymentStats;
const getRecentPayments = paymentService.getRecentPayments;
const generatePaymentInvoice = paymentService.generatePaymentInvoice;
const getTenantPaymentMethods = paymentService.getTenantPaymentMethods;
const addPaymentMethod = paymentService.addPaymentMethod;
const removePaymentMethod = paymentService.removePaymentMethod;
const setDefaultPaymentMethod = paymentService.setDefaultPaymentMethod;

export default paymentService;
export {
  getAllPayments,
  getPaymentsByProperty,
  getLandlordPayments,
  getTenantPayments,
  getPaymentById,
  getUpcomingPaymentsForTenant,
  getUpcomingPayments, // Export the alias
  makePayment,
  makePaymentWithNewCard,
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPayment,
  getPaymentReceiptUrl,
  getLandlordPaymentStats,
  getRecentPayments,
  generatePaymentInvoice,
  getTenantPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
}; 