import { Order, OrderItem, Customer, Product, Variant, User, Address, Shipment } from '../models.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Cart, CartItem } from '../models.js';
import { orderConfirmationTemplate, orderShipmentTemplate } from '../utils/emailTemplates.js';
import nodemailer from 'nodemailer';

/**
 * Get all orders with pagination
 * @route GET /api/orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtros
    const where = {};
    
    // Filtro por status
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Filtro por data inicial
    if (req.query.startDate) {
      where.created_at = {
        ...where.created_at,
        [Op.gte]: new Date(req.query.startDate)
      };
    }
    
    // Filtro por data final
    if (req.query.endDate) {
      where.created_at = {
        ...where.created_at,
        [Op.lte]: new Date(req.query.endDate)
      };
    }
    
    // Filtro por cliente (se não for admin/manager/sales)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (customer) {
        where.customer_id = customer.id;
      } else {
        // Se não tem customer, não deve ver nenhum pedido
        return res.status(200).json({
          orders: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        });
      }
    } else if (req.query.customerId) {
      // Admin/manager/sales podem filtrar por customerId
      where.customer_id = req.query.customerId;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { 
          model: Customer, 
          include: [
            { 
              model: User, 
              attributes: ['id', 'name', 'email'] 
            }
          ]
        },
        {
          model: Address,
          as: 'shipping_address',
          attributes: ['street', 'number', 'complement', 'district', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: Address,
          as: 'billing_address',
          attributes: ['street', 'number', 'complement', 'district', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: Shipment,
          attributes: ['id', 'tracking_code', 'carrier', 'estimated_delivery', 'status', 'shipping_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      orders: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get order by ID with all relationships
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar o pedido com todos os relacionamentos
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'description', 'sku']
            },
            {
              model: Variant,
              attributes: ['id', 'name', 'sku']
            }
          ]
        },
        { 
          model: Customer, 
          include: [
            { 
              model: User, 
              attributes: ['id', 'name', 'email'] 
            }
          ]
        },
        {
          model: Address,
          as: 'shipping_address',
          attributes: ['street', 'number', 'complement', 'district', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: Address,
          as: 'billing_address',
          attributes: ['street', 'number', 'complement', 'district', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: Shipment,
          attributes: ['id', 'tracking_code', 'carrier', 'estimated_delivery', 'status', 'shipping_date']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verificar permissão (admin/manager/sales podem ver qualquer pedido, customer só os seus)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (!customer || order.customer_id !== customer.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new order
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - Response with new order or error
 */
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      customer_id, 
      shipping_address_id, 
      billing_address_id, 
      payment_method, 
      payment_details,
      shipping_method, 
      items,
      total_amount,
      subtotal_amount,
      tax_amount,
      shipping_amount,
      notes
    } = req.body;
    
    // Validate that the user has permission to create this order
    if (req.user.role !== 'admin' && req.user.id !== customer_id) {
      return res.status(403).json({ message: 'You do not have permission to create this order' });
    }
    
    // Validate required fields
    if (!customer_id || !shipping_address_id || !payment_method || !items || !items.length) {
      return res.status(400).json({ message: 'Missing required order information' });
    }
    
    // Retrieve customer to make sure they exist
    const customer = await Customer.findByPk(customer_id, { transaction });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid customer' });
    }
    
    // Validate shipping address
    const shippingAddress = await Address.findOne({
      where: { 
        id: shipping_address_id,
        customer_id
      },
      transaction
    });
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Invalid shipping address' });
    }
    
    // Validate billing address
    const billingAddress = await Address.findOne({
      where: { 
        id: billing_address_id || shipping_address_id,
        customer_id
      },
      transaction
    });
    
    if (!billingAddress) {
      return res.status(400).json({ message: 'Invalid billing address' });
    }
    
    // Validate each item and check inventory
    for (const item of items) {
      const { variant_id, product_id, quantity } = item;
      
      let productVariant;
      if (variant_id) {
        productVariant = await ProductVariant.findByPk(variant_id, {
          include: [{ model: Product }],
          transaction
        });
        
        if (!productVariant) {
          await transaction.rollback();
          return res.status(400).json({ message: `Product variant (ID: ${variant_id}) not found` });
        }
        
        // Check inventory
        if (productVariant.stock_quantity < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Insufficient inventory for ${productVariant.Product?.name || 'product'} - ${productVariant.name}. 
                     Only ${productVariant.stock_quantity} available.` 
          });
        }
      } else if (product_id) {
        const product = await Product.findByPk(product_id, { transaction });
        
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ message: `Product (ID: ${product_id}) not found` });
        }
        
        // Check inventory
        if (product.stock_quantity < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Insufficient inventory for ${product.name}. Only ${product.stock_quantity} available.` 
          });
        }
      } else {
        await transaction.rollback();
        return res.status(400).json({ message: 'Each item must have either a product_id or variant_id' });
      }
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create the order
    const order = await Order.create({
      order_number: orderNumber,
      customer_id,
      user_id: req.user.id,
      status: 'pending',
      shipping_address_id,
      billing_address_id,
      shipping_method,
      shipping_amount,
      payment_method,
      payment_details,
      subtotal_amount,
      tax_amount,
      total_amount,
      notes,
      placed_at: new Date()
    }, { transaction });
    
    // Create order items
    const orderItems = [];
    for (const item of items) {
      const { variant_id, product_id, quantity, unit_price, total_price, tax_rate, tax_amount } = item;
      
      // Create order item
      const orderItem = await OrderItem.create({
        order_id: order.id,
        product_id,
        variant_id,
        quantity,
        unit_price,
        total_price,
        tax_rate,
        tax_amount
      }, { transaction });
      
      orderItems.push(orderItem);
      
      // Update inventory
      if (variant_id) {
        await ProductVariant.decrement('stock_quantity', { 
          by: quantity, 
          where: { id: variant_id },
          transaction 
        });
      } else if (product_id) {
        await Product.decrement('stock_quantity', { 
          by: quantity, 
          where: { id: product_id },
          transaction 
        });
      }
    }
    
    // Process payment
    try {
      await processPayment(payment_method, payment_details, total_amount, order.id, transaction);
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ message: `Payment failed: ${error.message}` });
    }
    
    // Clear user's cart
    try {
      await Cart.destroy({
        where: { user_id: req.user.id },
        transaction
      });
      
      await CartItem.destroy({
        where: { cart_id: { [Op.in]: await Cart.findAll({ where: { user_id: req.user.id }, attributes: ['id'] }).then(carts => carts.map(c => c.id)) } },
        transaction
      });
    } catch (error) {
      console.error('Failed to clear cart, but order was created:', error);
      // Don't roll back, just log the error
    }
    
    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order, customer, orderItems);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't roll back for email failures
    }
    
    // Commit the transaction
    await transaction.commit();
    
    // Return the created order
    return res.status(201).json({ 
      message: 'Order placed successfully', 
      id: order.id,
      order_number: order.order_number
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to place order. Please try again later.' });
  }
};

/**
 * Generate a unique order number
 * 
 * @returns {string} - Unique order number
 */
const generateOrderNumber = () => {
  const prefix = 'ALI';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Process payment for an order
 * 
 * @param {string} paymentMethod - Payment method
 * @param {Object} paymentDetails - Payment details
 * @param {number} amount - Payment amount
 * @param {number} orderId - Order ID
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise} - Resolves if payment successful
 */
const processPayment = async (paymentMethod, paymentDetails, amount, orderId, transaction) => {
  // This is a placeholder for actual payment processing
  // In a real application, we would integrate with payment processors like Stripe, PayPal, etc.
  switch (paymentMethod) {
    case 'credit_card':
      // Validate credit card information
      if (!paymentDetails.cardData || !paymentDetails.cardData.cardNumber) {
        throw new Error('Invalid credit card information');
      }
      
      // Create a payment record
      
      
      break;
      
    case 'wire_transfer':
      // Create a payment record with pending status
      
      
      break;
      
    case 'purchase_order':
      // Create a payment record with pending status
      
      
      break;
      
    default:
      throw new Error('Unsupported payment method');
  }
  
  return true;
};

/**
 * Send order confirmation email
 * 
 * @param {Object} order - Order object
 * @param {Object} customer - Customer object
 * @param {Array} orderItems - Order items
 * @returns {Promise} - Resolves when email is sent
 */
const sendOrderConfirmationEmail = async (order, customer, orderItems) => {
  // This is a placeholder for actual email sending
  // In a real application, we would use a library like nodemailer or an email service API
  console.log(`
    Sending order confirmation email:
    To: ${customer.email}
    Subject: Your Order Confirmation - ${order.order_number}
    Body: Thank you for your order...
  `);
  
  return true;
};

/**
 * Send order shipment notification email
 * 
 * @param {Object} order - Order object
 * @param {Object} shipment - Shipment object
 * @returns {Promise} - Resolves when email is sent
 */
const sendShipmentNotificationEmail = async (order, shipment) => {
  try {
    // Fetch complete order with customer data
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { 
          model: Customer, 
          include: [{ model: User, attributes: ['name', 'email'] }]
        }
      ]
    });
    
    // Get user email from customer relation
    const userEmail = completeOrder?.customer?.user?.email;
    
    if (!userEmail) {
      console.warn(`No email found for order ID ${order.id} - skipping shipment notification email`);
      return false;
    }
    
    // Generate email HTML using template
    const emailHtml = orderShipmentTemplate(
      completeOrder || order,
      shipment,
      completeOrder?.customer
    );
    
    // Send the email
    await sendEmail({
      to: userEmail,
      subject: `Your Order ${order.order_number} Has Shipped`,
      html: emailHtml
    });
    
    console.log(`Shipment notification email sent for order ${order.order_number} to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send shipment notification email: ${error.message}`, error);
    return false;
  }
};

/**
 * Generic function to send emails
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Optional plain text version
 * @returns {Promise} - Resolves when email is sent
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'noreply@alitools.com',
      pass: process.env.EMAIL_PASSWORD || 'yourpassword'
    }
  };
  
  // For development/testing, log email instead of sending if no credentials
  if (process.env.NODE_ENV !== 'production' || !process.env.EMAIL_PASSWORD) {
    console.log('Email would be sent in production:', {
      to,
      subject,
      html: html ? '(HTML content omitted for brevity)' : undefined,
      text
    });
    return true;
  }
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"AliTools B2B" <noreply@alitools.com>',
      to,
      subject,
      html,
      text: text || (html ? undefined : 'Please use an HTML email client to view this message.')
    });
    
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`, error);
    throw error;
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Verificar se o pedido existe
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verificar permissões (apenas admin/manager/sales podem atualizar status)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only admins, managers, and sales can update order status.' });
    }
    
    // Verificar se o status é válido
    const validStatus = ['pending', 'approved', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatus.join(', ')}` });
    }
    
    // Verificar transições de status válidas
    const invalidTransitions = {
      delivered: ['pending', 'approved', 'paid'],
      cancelled: ['delivered', 'shipped'],
      returned: ['pending', 'approved', 'paid', 'cancelled']
    };
    
    if (invalidTransitions[status] && invalidTransitions[status].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot change order from '${order.status}' to '${status}'`
      });
    }
    
    // Atualizar o status e notas
    const updateData = { status };
    if (notes) {
      updateData.notes = order.notes 
        ? `${order.notes}\n${new Date().toISOString()} - ${req.user.name}: ${notes}`
        : `${new Date().toISOString()} - ${req.user.name}: ${notes}`;
    }
    
    await order.update(updateData);
    
    // Retornar o pedido atualizado
    return res.status(200).json({ 
      id: order.id,
      status: order.status,
      notes: order.notes,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Cancel order
 * @route POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Verificar se o pedido existe
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Apenas admin, manager, sales e o próprio cliente podem cancelar pedidos
    let hasPermission = ['admin', 'manager', 'sales'].includes(req.user.role);
    
    if (!hasPermission) {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (customer && customer.id === order.customer_id) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Access denied. You cannot cancel this order.' });
    }
    
    // Verificar se o pedido pode ser cancelado
    if (['delivered', 'returned', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status '${order.status}'`
      });
    }
    
    // Preparar nota de cancelamento
    const cancelNote = `${new Date().toISOString()} - Cancelled by ${req.user.name}. Reason: ${reason || 'Not provided'}`;
    
    // Atualizar o status e notas
    await order.update({ 
      status: 'cancelled',
      notes: order.notes ? `${order.notes}\n${cancelNote}` : cancelNote
    });
    
    return res.status(200).json({ 
      id: order.id,
      status: 'cancelled',
      notes: order.notes,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add shipment to order
 * @route POST /api/orders/:id/shipment
 */
export const addShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    // Verificar se o pedido existe
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verificar permissões (apenas admin/manager/sales podem adicionar shipment)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only admins, managers, and sales can add shipments.' });
    }
    
    // Verificar se o pedido já foi enviado
    if (['cancelled', 'returned'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot add shipment to a ${order.status} order` });
    }
    
    // Criar o shipment
    const shipment = await Shipment.create({
      ...shipmentData,
      order_id: id,
      shipping_date: shipmentData.shipping_date || new Date(),
      status: shipmentData.status || 'processing'
    });
    
    // Atualizar o status do pedido para 'shipped' se ainda não estiver
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      await order.update({ 
        status: 'shipped',
        notes: order.notes 
          ? `${order.notes}\n${new Date().toISOString()} - Shipped by ${req.user.name}`
          : `${new Date().toISOString()} - Shipped by ${req.user.name}`
      });
    }
    
    // Send shipment notification email
    try {
      await sendShipmentNotificationEmail(order, shipment);
    } catch (error) {
      console.error('Failed to send shipment notification email:', error);
      // Don't fail the API call if email fails
    }
    
    return res.status(201).json(shipment);
  } catch (error) {
    console.error('Error adding shipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update shipment
 * @route PUT /api/orders/:orderId/shipment/:shipmentId
 */
export const updateShipment = async (req, res) => {
  try {
    const { orderId, shipmentId } = req.params;
    const shipmentData = req.body;
    
    // Verificar se o shipment existe e pertence ao pedido
    const shipment = await Shipment.findOne({
      where: {
        id: shipmentId,
        order_id: orderId
      }
    });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found or does not belong to this order' });
    }
    
    // Verificar permissões (apenas admin/manager/sales podem atualizar shipment)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only admins, managers, and sales can update shipments.' });
    }
    
    // Atualizar o shipment
    await shipment.update(shipmentData);
    
    // Se o status do shipment for 'delivered', atualizar o status do pedido
    if (shipmentData.status === 'delivered') {
      const order = await Order.findByPk(orderId);
      if (order && order.status !== 'delivered') {
        await order.update({
          status: 'delivered',
          notes: order.notes 
            ? `${order.notes}\n${new Date().toISOString()} - Delivered`
            : `${new Date().toISOString()} - Delivered`
        });
      }
    }
    
    return res.status(200).json(shipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 