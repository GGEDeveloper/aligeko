import { 
  User, 
  Customer, 
  Address, 
  Order, 
  OrderItem, 
  Shipment, 
  Product, 
  Variant 
} from '../../../src/models';
import sequelize from '../../../src/config/database';

// Use in-memory SQLite database for tests
beforeAll(async () => {
  // Force sync all models to the test database
  await sequelize.sync({ force: true });
});

// Clean up after tests
afterAll(async () => {
  await sequelize.close();
});

describe('Order Model', () => {
  let testUser;
  let testCustomer;
  let testAddress;
  let testOrder;
  let testProduct;
  let testVariant;

  beforeEach(async () => {
    // Create test data dependencies
    testUser = await User.create({
      email: 'order-test@example.com',
      password: 'OrderTest123!',
      firstName: 'Order',
      lastName: 'Test',
      role: 'customer',
      status: 'active',
      isApproved: true
    });

    testCustomer = await Customer.create({
      user_id: testUser.id,
      companyName: 'Order Test Company',
      taxId: '12345678901',
      contactPhone: '+1234567890',
      creditLimit: 10000.00
    });

    testAddress = await Address.create({
      customer_id: testCustomer.id,
      street: '123 Order St',
      city: 'Order City',
      state: 'OS',
      zip: '12345',
      country: 'Orderland',
      type: 'shipping'
    });

    testProduct = await Product.create({
      code: 'TEST-PROD',
      name: 'Test Product',
      description_short: 'Test product for orders'
    });

    testVariant = await Variant.create({
      product_id: testProduct.id,
      code: 'TEST-VAR',
      weight: 1.0,
      gross_weight: 1.2
    });

    // Create a test order
    testOrder = await Order.create({
      customer_id: testCustomer.id,
      shipping_address_id: testAddress.id,
      billing_address_id: testAddress.id, // Use same address for billing
      order_number: 'ORD-12345',
      status: 'pending',
      total_price: 199.99,
      currency: 'USD',
      payment_method: 'credit_card',
      payment_status: 'pending'
    });
  });

  afterEach(async () => {
    // Clean up all test data in reverse order of dependencies
    await OrderItem.destroy({ where: {}, force: true });
    await Shipment.destroy({ where: {}, force: true });
    await Order.destroy({ where: {}, force: true });
    await Variant.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    await Address.destroy({ where: {}, force: true });
    await Customer.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  test('should create an order successfully', async () => {
    expect(testOrder).toBeDefined();
    expect(testOrder.id).toBeDefined();
    expect(testOrder.order_number).toBe('ORD-12345');
    expect(testOrder.status).toBe('pending');
    expect(parseFloat(testOrder.total_price)).toBe(199.99);
    expect(testOrder.currency).toBe('USD');
    expect(testOrder.customer_id).toBe(testCustomer.id);
    expect(testOrder.shipping_address_id).toBe(testAddress.id);
    expect(testOrder.billing_address_id).toBe(testAddress.id);
  });

  test('should not create an order without required fields', async () => {
    try {
      await Order.create({
        // Missing customer_id and other required fields
        status: 'pending'
      });
      // Should not reach this line
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  test('should create an order with order items', async () => {
    // Create order items for the test order
    const orderItem = await OrderItem.create({
      order_id: testOrder.id,
      variant_id: testVariant.id,
      quantity: 2,
      unit_price: 99.99,
      total_price: 199.98
    });

    // Retrieve order with order items
    const orderWithItems = await Order.findByPk(testOrder.id, {
      include: [OrderItem]
    });

    expect(orderWithItems).toBeDefined();
    expect(orderWithItems.OrderItems).toBeDefined();
    expect(orderWithItems.OrderItems.length).toBe(1);
    expect(orderWithItems.OrderItems[0].quantity).toBe(2);
    expect(parseFloat(orderWithItems.OrderItems[0].unit_price)).toBe(99.99);
    expect(parseFloat(orderWithItems.OrderItems[0].total_price)).toBe(199.98);
  });

  test('should create an order with shipment', async () => {
    // Create a shipment for the test order
    const shipment = await Shipment.create({
      order_id: testOrder.id,
      tracking_number: 'TRACK123456',
      carrier: 'Test Carrier',
      shipping_method: 'Standard',
      status: 'processing',
      shipping_cost: 15.99,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Retrieve order with shipment
    const orderWithShipment = await Order.findByPk(testOrder.id, {
      include: [Shipment]
    });

    expect(orderWithShipment).toBeDefined();
    expect(orderWithShipment.Shipments).toBeDefined();
    expect(orderWithShipment.Shipments.length).toBe(1);
    expect(orderWithShipment.Shipments[0].tracking_number).toBe('TRACK123456');
    expect(orderWithShipment.Shipments[0].status).toBe('processing');
    expect(parseFloat(orderWithShipment.Shipments[0].shipping_cost)).toBe(15.99);
  });

  test('should update an order successfully', async () => {
    await testOrder.update({
      status: 'processing',
      payment_status: 'paid',
      total_price: 249.99 // Price changed due to additional items
    });

    // Reload the order from the database
    await testOrder.reload();

    expect(testOrder.status).toBe('processing');
    expect(testOrder.payment_status).toBe('paid');
    expect(parseFloat(testOrder.total_price)).toBe(249.99);
    // Order number should remain unchanged
    expect(testOrder.order_number).toBe('ORD-12345');
  });

  test('should retrieve order with all associations', async () => {
    // Create order items
    await OrderItem.create({
      order_id: testOrder.id,
      variant_id: testVariant.id,
      quantity: 2,
      unit_price: 99.99,
      total_price: 199.98
    });

    // Create shipment
    await Shipment.create({
      order_id: testOrder.id,
      tracking_number: 'TRACK123456',
      carrier: 'Test Carrier',
      shipping_method: 'Standard',
      status: 'processing',
      shipping_cost: 15.99
    });

    // Retrieve order with all associations
    const orderWithAssociations = await Order.findByPk(testOrder.id, {
      include: [
        { model: Customer },
        { model: Address, as: 'ShippingAddress' },
        { model: Address, as: 'BillingAddress' },
        { model: OrderItem, include: [Variant] },
        { model: Shipment }
      ]
    });

    expect(orderWithAssociations).toBeDefined();
    
    // Verify customer association
    expect(orderWithAssociations.Customer).toBeDefined();
    expect(orderWithAssociations.Customer.companyName).toBe('Order Test Company');
    
    // Verify address associations
    expect(orderWithAssociations.ShippingAddress).toBeDefined();
    expect(orderWithAssociations.ShippingAddress.street).toBe('123 Order St');
    expect(orderWithAssociations.BillingAddress).toBeDefined();
    
    // Verify order items association
    expect(orderWithAssociations.OrderItems).toBeDefined();
    expect(orderWithAssociations.OrderItems.length).toBe(1);
    expect(orderWithAssociations.OrderItems[0].Variant).toBeDefined();
    expect(orderWithAssociations.OrderItems[0].Variant.code).toBe('TEST-VAR');
    
    // Verify shipment association
    expect(orderWithAssociations.Shipments).toBeDefined();
    expect(orderWithAssociations.Shipments.length).toBe(1);
    expect(orderWithAssociations.Shipments[0].tracking_number).toBe('TRACK123456');
  });

  test('should delete an order and its dependent records', async () => {
    // Create order items
    await OrderItem.create({
      order_id: testOrder.id,
      variant_id: testVariant.id,
      quantity: 2,
      unit_price: 99.99,
      total_price: 199.98
    });

    // Create shipment
    await Shipment.create({
      order_id: testOrder.id,
      tracking_number: 'TRACK123456',
      carrier: 'Test Carrier',
      shipping_method: 'Standard',
      status: 'processing',
      shipping_cost: 15.99
    });

    // Delete the order
    await testOrder.destroy();

    // Check if order was deleted
    const deletedOrder = await Order.findByPk(testOrder.id);
    expect(deletedOrder).toBeNull();

    // Check if associated records were deleted or orphaned based on your foreign key configuration
    const orphanedOrderItems = await OrderItem.findAll({ where: { order_id: testOrder.id } });
    const orphanedShipments = await Shipment.findAll({ where: { order_id: testOrder.id } });

    // If you have CASCADE delete, these should be empty
    // If not, you'd need to adjust the test accordingly
    expect(orphanedOrderItems.length).toBe(0);
    expect(orphanedShipments.length).toBe(0);
  });
}); 