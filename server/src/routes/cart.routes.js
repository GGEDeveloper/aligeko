import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router
  .route('/')
  /**
   * @swagger
   * /api/v1/cart:
   *   get:
   *     summary: Get user cart with items
   *     description: Retrieves current user's cart with all items and details
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cart retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  .get(requireAuth, asyncHandler(cartController.getUserCart))
  /**
   * @swagger
   * /api/v1/cart:
   *   post:
   *     summary: Sync cart with server
   *     description: Synchronizes client-side cart with server (useful on login)
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - items
   *             properties:
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *               guest_cart_id:
   *                 type: string
   *     responses:
   *       200:
   *         description: Cart synchronized successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  .post(requireAuth, asyncHandler(cartController.syncCart))
  /**
   * @swagger
   * /api/v1/cart:
   *   delete:
   *     summary: Clear user cart
   *     description: Removes all items from user's cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cart cleared successfully
   *       401:
   *         description: Unauthorized
   */
  .delete(requireAuth, asyncHandler(cartController.clearCart));

router
  .route('/items')
  /**
   * @swagger
   * /api/v1/cart/items:
   *   post:
   *     summary: Add item to cart
   *     description: Add a new item to the user's cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - variant_id
   *               - quantity
   *             properties:
   *               variant_id:
   *                 type: integer
   *               quantity:
   *                 type: integer
   *               custom_data:
   *                 type: object
   *     responses:
   *       201:
   *         description: Item added to cart
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   */
  .post(requireAuth, asyncHandler(cartController.addCartItem));

router
  .route('/items/:item_id')
  /**
   * @swagger
   * /api/v1/cart/items/{item_id}:
   *   put:
   *     summary: Update cart item
   *     description: Update quantity or other properties of a cart item
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: item_id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Cart item updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Cart item not found
   */
  .put(requireAuth, asyncHandler(cartController.updateCartItem))
  /**
   * @swagger
   * /api/v1/cart/items/{item_id}:
   *   delete:
   *     summary: Remove cart item
   *     description: Remove an item from user's cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: item_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Item removed from cart
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Cart item not found
   */
  .delete(requireAuth, asyncHandler(cartController.removeCartItem));

export default router; 