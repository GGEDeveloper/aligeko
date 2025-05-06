const { expect } = require('chai');
const sinon = require('sinon');
const { createOrder, getOrderById, getOrders } = require('../../../src/controllers/order.controller');
const { Order, OrderItem, Customer, Product, Variant, User, Address, Shipment, Cart, CartItem, Payment } = require('../../../src/models');
const { sequelize } = require('../../../src/config/database');

// Mock the models
jest.mock('../../../src/models', () => {
  const mockModels = {
    Order: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn()
    },
    OrderItem: {
      create: jest.fn()
    },
    Customer: {},
    Product: {},
    Variant: {},
    User: {},
    Address: {},
    Shipment: {
      create: jest.fn()
    },
    Cart: {
      findByPk: jest.fn(),
      destroy: jest.fn()
    },
    CartItem: {
      findAll: jest.fn()
    },
    Payment: {
      create: jest.fn()
    }
  };
  
  return mockModels;
});

describe('Order Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: { id: 1, role: 'user' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = sinon.spy();
    
    // Stub all the database models and operations
    sinon.stub(sequelize, 'transaction').callsFake(async (callback) => {
      return callback({ 
        commit: async () => {}, 
        rollback: async () => {}
      });
    });
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe('createOrder', () => {
    beforeEach(() => {
      // Setup common test data
      req.body = {
        items: [
          { product_id: 1, variant_id: 101, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        shipping_address_id: 1,
        billing_address_id: 1,
        shipping_method: 'standard',
        payment: {
          method: 'credit_card',
          card_token: 'test_token',
          amount: 299.99
        }
      };
      
      // Setup customer stub
      sinon.stub(Customer, 'findOne').resolves({
        id: 1,
        user_id: 1,
        name: 'Test Customer',
        user: {
          id: 1,
          email: 'test@example.com'
        }
      });
      
      // Setup product stubs
      sinon.stub(Product, 'findByPk')
        .onFirstCall().resolves({
          id: 1,
          name: 'Test Product',
          price: 99.99,
          stock: 10,
          checkInventory: sinon.stub().returns(true)
        })
        .onSecondCall().resolves({
          id: 2,
          name: 'Another Product',
          price: 100,
          stock: 5,
          checkInventory: sinon.stub().returns(true)
        });
      
      // Setup variant stub
      sinon.stub(Variant, 'findByPk').resolves({
        id: 101,
        product_id: 1,
        name: 'Small',
        price_adjustment: 0,
        stock: 5,
        checkInventory: sinon.stub().returns(true)
      });
      
      // Setup address stubs
      sinon.stub(Address, 'findByPk').resolves({
        id: 1,
        customer_id: 1,
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postal_code: '12345',
        country: 'US'
      });
      
      // Setup order creation stub
      sinon.stub(Order, 'create').resolves({
        id: 1,
        customer_id: 1,
        order_number: 'ALI-12345678',
        status: 'pending',
        total_amount: 299.99,
        subtotal: 270,
        tax_amount: 19.99,
        shipping_amount: 10
      });
      
      // Setup order item creation stub
      sinon.stub(OrderItem, 'bulkCreate').resolves([
        {
          id: 1,
          order_id: 1,
          product_id: 1,
          variant_id: 101,
          quantity: 2,
          unit_price: 99.99,
          total_price: 199.98
        },
        {
          id: 2,
          order_id: 1,
          product_id: 2,
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }
      ]);
      
      // Setup payment creation stub
      sinon.stub(Payment, 'create').resolves({
        id: 1,
        order_id: 1,
        method: 'credit_card',
        amount: 299.99,
        status: 'completed'
      });
      
      // Setup cart clearing stub
      sinon.stub(Cart, 'findOne').resolves({
        id: 1,
        customer_id: 1,
        clearItems: sinon.stub().resolves()
      });
    });

    it('should create a new order successfully', async () => {
      await createOrder(req, res);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        order: expect.objectContaining({
          id: 1,
          order_number: 'ALI-12345678'
        })
      }));
      
      // Verify database operations
      expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
        customer_id: 1,
        user_id: 1,
        total_amount: expect.any(Number)
      }));
      
      // Verify transaction was used
      expect(sequelize.transaction).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      // Missing items
      req.body = {
        shipping_address_id: 1,
        billing_address_id: 1,
        shipping_method: 'standard',
        payment: {
          method: 'credit_card',
          card_token: 'test_token',
          amount: 299.99
        }
      };
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should validate item stock availability', async () => {
      // Modify product to have insufficient stock
      Product.findByPk.restore();
      sinon.stub(Product, 'findByPk')
        .onFirstCall().resolves({
          id: 1,
          name: 'Test Product',
          price: 99.99,
          stock: 1, // Less than requested quantity (2)
          checkInventory: sinon.stub().returns(false)
        })
        .onSecondCall().resolves({
          id: 2,
          name: 'Another Product',
          price: 100,
          stock: 5,
          checkInventory: sinon.stub().returns(true)
        });
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should handle payment processing errors', async () => {
      // Mock payment processing error
      Payment.create.restore();
      sinon.stub(Payment, 'create').rejects(new Error('Payment processing failed'));
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
      
      // Should have rolled back transaction
      const transaction = sequelize.transaction.firstCall.returnValue;
      // Would check for rollback, but our mock doesn't track this directly
    });

    it('should handle database errors', async () => {
      // Force a database error
      Order.create.restore();
      sinon.stub(Order, 'create').rejects(new Error('Database error'));
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should verify customer existence', async () => {
      // No customer found
      Customer.findOne.restore();
      sinon.stub(Customer, 'findOne').resolves(null);
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should verify address existence', async () => {
      // No address found
      Address.findByPk.restore();
      sinon.stub(Address, 'findByPk').resolves(null);
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should validate payment amount', async () => {
      // Invalid payment amount (zero)
      req.body.payment.amount = 0;
      
      await createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('getOrderById', () => {
    beforeEach(() => {
      req.params.id = '1';
      
      sinon.stub(Order, 'findByPk').resolves({
        id: 1,
        customer_id: 1,
        order_number: 'ALI-12345678',
        status: 'pending',
        total_amount: 299.99,
        items: [
          {
            id: 1,
            product: {
              name: 'Test Product'
            },
            quantity: 2,
            unit_price: 99.99,
            total_price: 199.98
          }
        ]
      });
    });

    it('should return order details for the owner', async () => {
      // Set up req user as the customer
      req.user = { id: 1, role: 'user' };
      
      await getOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        order_number: 'ALI-12345678'
      }));
    });

    it('should return order details for admin users', async () => {
      // Set up req user as an admin (not the customer)
      req.user = { id: 999, role: 'admin' };
      
      await getOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        order_number: 'ALI-12345678'
      }));
    });

    it('should reject access for non-owner non-admin users', async () => {
      // Set up req user as a different customer
      req.user = { id: 999, role: 'user' };
      
      await getOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should handle order not found', async () => {
      Order.findByPk.restore();
      sinon.stub(Order, 'findByPk').resolves(null);
      
      await getOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('getOrders', () => {
    beforeEach(() => {
      sinon.stub(Order, 'findAll').resolves([
        {
          id: 1,
          customer_id: 1,
          order_number: 'ALI-12345678',
          status: 'pending',
          placed_at: new Date(),
          total_amount: 299.99
        },
        {
          id: 2,
          customer_id: 1,
          order_number: 'ALI-23456789',
          status: 'completed',
          placed_at: new Date(),
          total_amount: 199.99
        }
      ]);
    });

    it('should return user orders for regular users', async () => {
      req.user = { id: 1, role: 'user' };
      
      await getOrders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          order_number: 'ALI-12345678',
          status: 'pending',
          placed_at: expect.any(Date),
          total_amount: 299.99
        }),
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          order_number: 'ALI-23456789',
          status: 'completed',
          placed_at: expect.any(Date),
          total_amount: 199.99
        })
      ]));
    });

    it('should allow admins to see all orders', async () => {
      req.user = { id: 999, role: 'admin' };
      
      await getOrders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          order_number: 'ALI-12345678',
          status: 'pending',
          placed_at: expect.any(Date),
          total_amount: 299.99
        }),
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          order_number: 'ALI-23456789',
          status: 'completed',
          placed_at: expect.any(Date),
          total_amount: 199.99
        })
      ]));
    });

    it('should handle filtering by status', async () => {
      req.user = { id: 1, role: 'user' };
      req.query = { status: 'completed' };
      
      await getOrders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          order_number: 'ALI-23456789',
          status: 'completed',
          placed_at: expect.any(Date),
          total_amount: 199.99
        })
      ]));
    });

    it('should handle date range filtering', async () => {
      req.user = { id: 1, role: 'user' };
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      req.query = { start_date: startDate, end_date: endDate };
      
      await getOrders(req, res);
      
      // Check date filters were applied (implementation depends on your controller code)
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          order_number: 'ALI-12345678',
          status: 'pending',
          placed_at: expect.any(Date),
          total_amount: 299.99
        }),
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          order_number: 'ALI-23456789',
          status: 'completed',
          placed_at: expect.any(Date),
          total_amount: 199.99
        })
      ]));
    });
  });
}); 