/**
 * API Routes
 * 
 * Main entry point for all API routes
 */

import express from 'express';
import productRoutes from './product.routes.js';

import authRoutes from './auth.routes.js';

import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import fileUploadRoutes from './file-upload.routes.js';
import customerRoutes from './customer.routes.js';
import gekoApiRoutes from './geko-api.routes.js';
import companyInfoRoutes from './companyInfo.js';
// import adminRoutes from './admin.routes';

const router = express.Router();

// API version prefix
const API_PREFIX = '/v1';

// Register routes
router.use(`${API_PREFIX}/products`, productRoutes);

router.use(`${API_PREFIX}/auth`, authRoutes);

router.use(`${API_PREFIX}/cart`, cartRoutes);
router.use(`${API_PREFIX}/orders`, orderRoutes);
router.use(`${API_PREFIX}/upload`, fileUploadRoutes);
router.use(`${API_PREFIX}/customers`, customerRoutes);
router.use(`${API_PREFIX}/geko-api`, gekoApiRoutes);
router.use(`${API_PREFIX}/company-info`, companyInfoRoutes);
// router.use(`${API_PREFIX}/admin`, adminRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'AliTools B2B API',
    version: '1.0.0',
    endpoints: [
      { path: '/health', description: 'Health check endpoint' },
      { path: '/api/v1/auth', description: 'Authentication endpoints' },
      { path: '/api/v1/products', description: 'Product management endpoints' },
      { path: '/api/v1/orders', description: 'Order management endpoints' },
      { path: '/api/v1/customers', description: 'Customer management endpoints' },
      { path: '/api/v1/geko-api', description: 'GEKO API integration endpoints' },
      { path: '/api/v1/cart', description: 'Shopping cart endpoints' },
      { path: '/api/v1/company-info', description: 'Company information endpoints' },
      { path: '/api/v1/upload', description: 'File upload and import endpoints' },
      { path: '/api/v1/admin', description: 'Admin management endpoints' }
    ]
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

export default router; 