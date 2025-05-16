import { Cart, CartItem, Variant, Product, Image, Stock, Price } from '../models.js';
import sequelize from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Get user cart with items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Cart with items
 */
export const getUserCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find or create user cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        last_modified: new Date()
      }
    });

    // Get cart items with product details
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: Variant,
          include: [
            {
              model: Product,
              include: [{ model: Image }]
            },
            { model: Stock },
            { model: Price }
          ]
        }
      ],
      order: [['added_at', 'DESC']]
    });

    // Format the response
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      product_id: item.Variant.Product.id,
      product_name: item.Variant.Product.name,
      variant_id: item.variant_id,
      variant_code: item.Variant.code,
      quantity: item.quantity,
      price: parseFloat(item.price),
      added_at: item.added_at,
      image: item.Variant.Product.Images && item.Variant.Product.Images.length > 0
        ? item.Variant.Product.Images[0].url
        : null,
      available_stock: item.Variant.Stock ? item.Variant.Stock.quantity : 0,
      custom_data: item.custom_data || {}
    }));

    // Calculate totals
    const totalQuantity = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return res.status(200).json({
      cart_id: cart.id,
      last_modified: cart.last_modified,
      items: formattedItems,
      total_quantity: totalQuantity,
      total_amount: totalAmount
    });
  } catch (error) {
    console.error('Error getting user cart:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get cart');
  }
};

/**
 * Synchronize cart from frontend with backend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated cart with items
 */
export const syncCart = async (req, res) => {
  const userId = req.user.id;
  const { items, guest_cart_id } = req.body;

  if (!items || !Array.isArray(items)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Items array is required');
  }

  const transaction = await sequelize.transaction();

  try {
    // Find or create user cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        guest_cart_id,
        last_modified: new Date()
      },
      transaction
    });

    // If syncing from guest cart, update the guest_cart_id
    if (guest_cart_id && !cart.guest_cart_id) {
      await cart.update({ guest_cart_id }, { transaction });
    }

    // Clear existing cart items
    await CartItem.destroy({
      where: { cart_id: cart.id },
      transaction
    });

    // Validate and get current prices for variants
    const variantIds = items.map(item => item.variant_id);
    const variants = await Variant.findAll({
      where: { id: variantIds },
      include: [
        { model: Price },
        { model: Stock },
        { model: Product }
      ],
      transaction
    });

    // Create a map of variants for quick lookup
    const variantMap = variants.reduce((map, variant) => {
      map[variant.id] = variant;
      return map;
    }, {});

    // Create new cart items
    const newCartItems = [];
    for (const item of items) {
      const variant = variantMap[item.variant_id];
      
      if (!variant) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Variant with id ${item.variant_id} not found`);
      }

      // Get current price from variant or use provided price
      const currentPrice = variant.Prices && variant.Prices.length > 0
        ? variant.Prices[0].amount
        : item.price;

      // Check stock
      const stock = variant.Stock ? variant.Stock.quantity : 0;
      const quantity = Math.min(item.quantity, stock);
      
      if (quantity <= 0) {
        continue; // Skip out of stock items
      }

      // Create cart item
      const cartItem = await CartItem.create(
        {
          cart_id: cart.id,
          variant_id: variant.id,
          quantity,
          price: currentPrice,
          added_at: item.added_at || new Date(),
          custom_data: item.custom_data || {}
        },
        { transaction }
      );

      newCartItems.push(cartItem);
    }

    // Update cart last_modified
    await cart.update(
      { last_modified: new Date() },
      { transaction }
    );

    await transaction.commit();

    // Return updated cart
    return res.status(200).json({
      message: 'Cart synchronized successfully',
      cart_id: cart.id,
      last_modified: cart.last_modified,
      item_count: newCartItems.length
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error syncing cart:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to sync cart');
  }
};

/**
 * Add item to cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Added cart item
 */
export const addCartItem = async (req, res) => {
  const userId = req.user.id;
  const { variant_id, quantity, custom_data } = req.body;

  if (!variant_id || !quantity || quantity <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Valid variant_id and quantity are required');
  }

  try {
    // Find variant with product and stock
    const variant = await Variant.findByPk(variant_id, {
      include: [
        { model: Product },
        { model: Stock },
        { model: Price }
      ]
    });

    if (!variant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Variant not found');
    }

    // Check stock
    const stock = variant.Stock ? variant.Stock.quantity : 0;
    if (stock < quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Only ${stock} items available in stock`);
    }

    // Find or create user cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        last_modified: new Date()
      }
    });

    // Check if item already exists
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        variant_id: variant.id
      }
    });

    // Get current price
    const currentPrice = variant.Prices && variant.Prices.length > 0
      ? variant.Prices[0].amount
      : variant.Product.price || 0;

    if (cartItem) {
      // Update quantity and price
      cartItem = await cartItem.update({
        quantity: cartItem.quantity + quantity,
        price: currentPrice,
        added_at: new Date()
      });
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart.id,
        variant_id: variant.id,
        quantity,
        price: currentPrice,
        added_at: new Date(),
        custom_data: custom_data || {}
      });
    }

    // Update cart last_modified
    await cart.update({ last_modified: new Date() });

    return res.status(201).json({
      message: 'Item added to cart',
      cart_item: {
        id: cartItem.id,
        variant_id: cartItem.variant_id,
        quantity: cartItem.quantity,
        price: parseFloat(cartItem.price),
        product_name: variant.Product.name,
        variant_code: variant.code
      }
    });
  } catch (error) {
    console.error('Error adding cart item:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add item to cart');
  }
};

/**
 * Update cart item quantity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated cart item
 */
export const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { item_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Valid quantity is required');
  }

  try {
    // Find cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: {
        id: item_id,
        cart_id: cart.id
      },
      include: [
        {
          model: Variant,
          include: [{ model: Stock }]
        }
      ]
    });

    if (!cartItem) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }

    // Check stock if increasing quantity
    if (quantity > cartItem.quantity) {
      const stock = cartItem.Variant.Stock ? cartItem.Variant.Stock.quantity : 0;
      if (stock < quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Only ${stock} items available in stock`);
      }
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await cartItem.destroy();
      
      // Update cart last_modified
      await cart.update({ last_modified: new Date() });
      
      return res.status(200).json({
        message: 'Item removed from cart'
      });
    } else {
      // Update quantity
      await cartItem.update({ quantity });
      
      // Update cart last_modified
      await cart.update({ last_modified: new Date() });
      
      return res.status(200).json({
        message: 'Cart item updated',
        cart_item: {
          id: cartItem.id,
          variant_id: cartItem.variant_id,
          quantity: quantity
        }
      });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update cart item');
  }
};

/**
 * Remove item from cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { item_id } = req.params;

  try {
    // Find cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: {
        id: item_id,
        cart_id: cart.id
      }
    });

    if (!cartItem) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    }

    // Delete cart item
    await cartItem.destroy();
    
    // Update cart last_modified
    await cart.update({ last_modified: new Date() });

    return res.status(200).json({
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove item from cart');
  }
};

/**
 * Clear user cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(200).json({
        message: 'Cart is already empty'
      });
    }

    // Delete all cart items
    await CartItem.destroy({
      where: { cart_id: cart.id }
    });
    
    // Update cart last_modified
    await cart.update({ last_modified: new Date() });

    return res.status(200).json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to clear cart');
  }
}; 