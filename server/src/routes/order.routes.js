import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate as isAuthenticated } from '../middleware/auth.middleware';
import { isAdmin, isManager, isSales } from '../middleware/role.js';

const router = Router();

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with pagination
 * @access  Private (Any authenticated user)
 */
router.get('/', isAuthenticated, orderController.getAllOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private (Any authenticated user - but customers can only access their own orders)
 */
router.get('/:id', isAuthenticated, orderController.getOrderById);

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private (Any authenticated user - but customers can only create orders for themselves)
 */
router.post('/', isAuthenticated, orderController.createOrder);

/**
 * @route   PUT /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin, Manager, Sales)
 */
router.put('/:id/status', isAuthenticated, isSales, orderController.updateOrderStatus);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Admin, Manager, Sales, Order Owner)
 */
router.post('/:id/cancel', isAuthenticated, orderController.cancelOrder);

/**
 * @route   POST /api/v1/orders/:id/shipment
 * @desc    Add shipment to order
 * @access  Private (Admin, Manager, Sales)
 */
router.post('/:id/shipment', isAuthenticated, isSales, orderController.addShipment);

/**
 * @route   PUT /api/v1/orders/:orderId/shipment/:shipmentId
 * @desc    Update shipment
 * @access  Private (Admin, Manager, Sales)
 */
router.put('/:orderId/shipment/:shipmentId', isAuthenticated, isSales, orderController.updateShipment);

export default router; 