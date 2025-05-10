import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate as isAuthenticated } from '../middleware/auth.middleware';
import { isAdmin, isManager, isSales, isResourceOwner } from '../middleware/role.js';
import { Customer } from '../models.js';

const router = Router();

// Helper para verificar se o usuário é o dono do customer ou tem permissão
const isCustomerOwner = isResourceOwner('id', async (id) => {
  const customer = await Customer.findByPk(id);
  return customer ? customer.user_id : null;
});

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination
 * @access  Private (Admin, Manager, Sales)
 */
router.get('/', isAuthenticated, isSales, customerController.getAllCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private (Admin, Manager, Sales, Owner)
 */
router.get('/:id', isAuthenticated, isCustomerOwner, customerController.getCustomerById);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private (Admin, Manager)
 */
router.post('/', isAuthenticated, isManager, customerController.createCustomer);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Private (Admin, Manager, Owner)
 */
router.put('/:id', isAuthenticated, isCustomerOwner, customerController.updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Private (Admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, customerController.deleteCustomer);

/**
 * @route   POST /api/customers/:id/addresses
 * @desc    Add an address to a customer
 * @access  Private (Admin, Manager, Owner)
 */
router.post('/:id/addresses', isAuthenticated, isCustomerOwner, customerController.addAddress);

/**
 * @route   PUT /api/customers/:customerId/addresses/:addressId
 * @desc    Update an address
 * @access  Private (Admin, Manager, Owner)
 */
router.put('/:customerId/addresses/:addressId', isAuthenticated, isCustomerOwner, customerController.updateAddress);

/**
 * @route   DELETE /api/customers/:customerId/addresses/:addressId
 * @desc    Delete an address
 * @access  Private (Admin, Manager, Owner)
 */
router.delete('/:customerId/addresses/:addressId', isAuthenticated, isCustomerOwner, customerController.deleteAddress);

export default router; 