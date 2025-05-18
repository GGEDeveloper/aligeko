import api from './api';

const orderService = {
  /**
   * Get user orders with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Search term
   * @param {string} params.sort - Sort field and direction (e.g., 'date:desc')
   * @param {string} params.startDate - Start date for filtering
   * @param {string} params.endDate - End date for filtering
   * @returns {Promise<Object>} - Orders data with pagination info
   */
  getOrders: async (params = {}) => {
    const { page = 1, limit = 10, status, search, sort, startDate, endDate } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(search && { q: search }),
      ...(sort && { sort }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    try {
      const response = await api.get(`/api/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order details
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Created order
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID to cancel
   * @returns {Promise<Object>} - Updated order
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get order invoice
   * @param {string} orderId - Order ID
   * @returns {Promise<Blob>} - Invoice file
   */
  getOrderInvoice: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Track order status
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Tracking information
   */
  trackOrder: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderService;
