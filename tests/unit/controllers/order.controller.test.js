const { expect } = require('chai');
const sinon = require('sinon');
const { createOrder, getOrderById, getOrders } = require('../../../src/controllers/order.controller');
const { Order, OrderItem, Customer, Product, Variant, User, Address, Shipment, Cart, CartItem, Payment } = require('../../../src/models');

describe('Order Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    sinon.restore();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: { id: 1, role: 'customer' }
    };
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    
    next = sinon.stub();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      // Setup request body with order data
      req.body = {
        cartId: 123,
        shippingAddressId: 456,
        billingAddressId: 456,
        paymentMethod: 'credit_card',
        shippingMethod: 'standard'
      };

      // Mock Cart and CartItems
      const mockCart = {
        id: 123,
        userId: 1,
        cartItems: [
          {
            id: 1,
            productId: 101,
            variantId: 201,
            quantity: 2,
            price: 49.99,
            product: {
              name: 'Test Product 1'
            },
            variant: {
              name: 'Test Variant 1'
            }
          }
        ]
      };

      // Mock database operations
      sinon.stub(Cart, 'findByPk').resolves(mockCart);
      sinon.stub(Order, 'create').resolves({
        id: 1,
        orderNumber: 'ORD-123-ABC',
        userId: 1,
        totalAmount: 99.98
      });
      sinon.stub(OrderItem, 'create').resolves({});
      sinon.stub(Shipment, 'create').resolves({});
      sinon.stub(Payment, 'create').resolves({});
      sinon.stub(CartItem, 'destroy').resolves();
      sinon.stub(Cart, 'destroy').resolves();

      // Call the function
      await createOrder(req, res, next);

      // Assertions
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', true);
      expect(res.json.firstCall.args[0]).to.have.property('order');
      expect(res.json.firstCall.args[0].order).to.have.property('id', 1);
      expect(res.json.firstCall.args[0].order).to.have.property('orderNumber', 'ORD-123-ABC');
    });

    it('should handle missing cart error', async () => {
      // Setup request body with order data
      req.body = {
        cartId: 999, // Non-existent cart
        shippingAddressId: 456,
        billingAddressId: 456,
        paymentMethod: 'credit_card',
        shippingMethod: 'standard'
      };

      // Mock cart not found
      sinon.stub(Cart, 'findByPk').resolves(null);

      // Call the function
      await createOrder(req, res, next);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', false);
      expect(res.json.firstCall.args[0]).to.have.property('message');
      expect(res.json.firstCall.args[0].message).to.include('Cart not found');
    });

    it('should handle database errors', async () => {
      // Setup request body
      req.body = {
        cartId: 123,
        shippingAddressId: 456,
        billingAddressId: 456,
        paymentMethod: 'credit_card',
        shippingMethod: 'standard'
      };

      // Mock cart
      const mockCart = {
        id: 123,
        userId: 1,
        cartItems: [
          {
            id: 1,
            productId: 101,
            variantId: 201,
            quantity: 2,
            price: 49.99,
            product: {
              name: 'Test Product 1'
            },
            variant: {
              name: 'Test Variant 1'
            }
          }
        ]
      };

      // Mock successful cart find but error during order creation
      sinon.stub(Cart, 'findByPk').resolves(mockCart);
      const error = new Error('Database error');
      sinon.stub(Order, 'create').rejects(error);

      // Call the function
      await createOrder(req, res, next);

      // Assertions - should call next with the error
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('getOrderById', () => {
    it('should retrieve an order by ID', async () => {
      // Setup request parameters
      req.params.id = '1';
      
      // Mock order data
      const mockOrder = {
        id: 1,
        orderNumber: 'ORD-123-ABC',
        userId: 1,
        totalAmount: 99.98,
        status: 'processing',
        createdAt: new Date(),
        orderItems: [
          {
            id: 1,
            productId: 101,
            productName: 'Test Product',
            price: 49.99,
            quantity: 2
          }
        ],
        shipping: {
          method: 'standard',
          trackingNumber: 'TRK123456'
        },
        payment: {
          method: 'credit_card',
          status: 'completed'
        }
      };

      // Mock Order.findByPk
      sinon.stub(Order, 'findByPk').resolves(mockOrder);

      // Call the function
      await getOrderById(req, res, next);

      // Assertions
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', true);
      expect(res.json.firstCall.args[0]).to.have.property('order');
      expect(res.json.firstCall.args[0].order).to.deep.equal(mockOrder);
    });

    it('should handle order not found', async () => {
      // Setup request parameters
      req.params.id = '999'; // Non-existent order
      
      // Mock Order.findByPk returning null
      sinon.stub(Order, 'findByPk').resolves(null);

      // Call the function
      await getOrderById(req, res, next);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', false);
      expect(res.json.firstCall.args[0]).to.have.property('message');
      expect(res.json.firstCall.args[0].message).to.include('Order not found');
    });

    it('should restrict access to orders not belonging to the user', async () => {
      // Setup request 
      req.params.id = '2';
      req.user = { id: 1, role: 'customer' }; // User trying to access someone else's order
      
      // Mock order with different userId
      const mockOrder = {
        id: 2,
        orderNumber: 'ORD-456-DEF',
        userId: 2, // Different user
        totalAmount: 149.99
      };

      // Mock Order.findByPk
      sinon.stub(Order, 'findByPk').resolves(mockOrder);

      // Call the function
      await getOrderById(req, res, next);

      // Assertions
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', false);
      expect(res.json.firstCall.args[0]).to.have.property('message');
      expect(res.json.firstCall.args[0].message).to.include('unauthorized');
    });

    it('should allow admin users to access any order', async () => {
      // Setup request
      req.params.id = '2';
      req.user = { id: 1, role: 'admin' }; // Admin user
      
      // Mock order with different userId
      const mockOrder = {
        id: 2,
        orderNumber: 'ORD-456-DEF',
        userId: 2, // Different user
        totalAmount: 149.99
      };

      // Mock Order.findByPk
      sinon.stub(Order, 'findByPk').resolves(mockOrder);

      // Call the function
      await getOrderById(req, res, next);

      // Assertions
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', true);
      expect(res.json.firstCall.args[0]).to.have.property('order');
      expect(res.json.firstCall.args[0].order).to.deep.equal(mockOrder);
    });
  });

  describe('getOrders', () => {
    it('should get all orders for admin users', async () => {
      // Setup admin user
      req.user = { id: 1, role: 'admin' };
      
      // Mock orders
      const mockOrders = [
        { id: 1, userId: 1, orderNumber: 'ORD-123-ABC' },
        { id: 2, userId: 2, orderNumber: 'ORD-456-DEF' }
      ];

      // Mock Order.findAll
      sinon.stub(Order, 'findAll').resolves(mockOrders);

      // Call the function
      await getOrders(req, res, next);

      // Assertions
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', true);
      expect(res.json.firstCall.args[0]).to.have.property('orders');
      expect(res.json.firstCall.args[0].orders).to.deep.equal(mockOrders);
    });

    it('should get only user-specific orders for regular users', async () => {
      // Setup regular user
      req.user = { id: 1, role: 'customer' };
      
      // Mock user-specific orders
      const mockOrders = [
        { id: 1, userId: 1, orderNumber: 'ORD-123-ABC' },
        { id: 3, userId: 1, orderNumber: 'ORD-789-GHI' }
      ];

      // Mock Order.findAll with expected where clause
      const findAllStub = sinon.stub(Order, 'findAll').resolves(mockOrders);

      // Call the function
      await getOrders(req, res, next);

      // Assertions
      expect(findAllStub.calledOnce).to.be.true;
      expect(findAllStub.firstCall.args[0]).to.have.property('where');
      expect(findAllStub.firstCall.args[0].where).to.deep.equal({ userId: 1 });
      
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('success', true);
      expect(res.json.firstCall.args[0]).to.have.property('orders');
      expect(res.json.firstCall.args[0].orders).to.deep.equal(mockOrders);
    });

    it('should handle database errors', async () => {
      // Setup user
      req.user = { id: 1, role: 'customer' };
      
      // Mock database error
      const error = new Error('Database error');
      sinon.stub(Order, 'findAll').rejects(error);

      // Call the function
      await getOrders(req, res, next);

      // Assertions - should call next with the error
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });
}); 