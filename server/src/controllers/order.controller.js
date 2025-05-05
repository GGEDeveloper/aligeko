import { Order, OrderItem, Customer, Product, Variant, User, Address, Shipment } from '../models';
import { Op } from 'sequelize';

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
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      items,
      shipping_address_id,
      billing_address_id,
      payment_method,
      shipping_method,
      notes,
      ...orderData
    } = req.body;
    
    // Verificar se o customer existe
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Verificar permissões (apenas admin/manager/sales podem criar pedidos para outros customers)
    if (!['admin', 'manager', 'sales'].includes(req.user.role)) {
      const userCustomer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (!userCustomer || userCustomer.id !== customer_id) {
        return res.status(403).json({ message: 'Access denied. You can only create orders for yourself.' });
      }
    }
    
    // Verificar se os endereços existem e pertencem ao customer
    if (shipping_address_id) {
      const shippingAddress = await Address.findOne({ 
        where: { 
          id: shipping_address_id,
          customer_id 
        }
      });
      if (!shippingAddress) {
        return res.status(404).json({ message: 'Shipping address not found or does not belong to this customer' });
      }
    }
    
    if (billing_address_id) {
      const billingAddress = await Address.findOne({ 
        where: { 
          id: billing_address_id,
          customer_id 
        }
      });
      if (!billingAddress) {
        return res.status(404).json({ message: 'Billing address not found or does not belong to this customer' });
      }
    }
    
    // Verificar se há itens no pedido
    if (!items || !items.length) {
      return res.status(400).json({ message: 'An order must have at least one item' });
    }
    
    // Calcular o total do pedido
    let subtotal = 0;
    let total_items = 0;
    
    for (const item of items) {
      // Verificar estoque e validar produto/variante
      let variant = null;
      if (item.variant_id) {
        variant = await Variant.findByPk(item.variant_id);
        if (!variant) {
          return res.status(404).json({ message: `Variant with ID ${item.variant_id} not found` });
        }
      }
      
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
      }
      
      // Calcular o valor do item
      subtotal += item.price * item.quantity;
      total_items += item.quantity;
    }
    
    // Calcular taxas, frete, descontos (simplificado)
    const tax = orderData.tax || 0;
    const shipping = orderData.shipping || 0;
    const discount = orderData.discount || 0;
    
    const total = subtotal + tax + shipping - discount;
    
    // Criar o pedido
    const order = await Order.create({
      ...orderData,
      customer_id,
      shipping_address_id,
      billing_address_id,
      payment_method,
      shipping_method,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      total_items,
      notes,
      status: orderData.status || 'pending'
    });
    
    // Criar os itens do pedido
    await Promise.all(
      items.map(async (item) => {
        await OrderItem.create({
          ...item,
          order_id: order.id
        });
      })
    );
    
    // Buscar o pedido criado com todos os relacionamentos
    const createdOrder = await Order.findByPk(order.id, {
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
        }
      ]
    });
    
    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Internal server error' });
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