import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate as isAuthenticated } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.js';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', isAuthenticated, isAdmin, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Admin only)
 */
router.put('/:id', isAuthenticated, isAdmin, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);

export default router; 