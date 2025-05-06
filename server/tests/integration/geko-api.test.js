// Mock dependencies
jest.mock('axios');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id',
      response: 'mock-response'
    })
  })
}));
jest.mock('../../src/config/database', () => ({
  transaction: jest.fn(() => Promise.resolve({
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  }))
}));
jest.mock('../../src/models', () => ({
  Product: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Category: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Producer: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Unit: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Variant: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Stock: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Price: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Image: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  SyncHealth: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      sync_type: 'manual',
      status: 'success',
      start_time: new Date(),
      end_time: new Date(),
      duration_seconds: 2.5,
      api_url: 'https://api.geko.com/products',
      items_processed: {
        products: 2,
        categories: 1,
        producers: 1,
        units: 2,
        variants: 2,
        stocks: 2,
        prices: 2,
        images: 3
      },
      error_count: 0
    }),
    findAll: jest.fn().mockResolvedValue([])
  }
}));
jest.mock('../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

import request from 'supertest';
import app from '../../src/app';
import axios from 'axios';
import { GekoDataService } from '../../src/services/geko-data-service';
import { SyncHealthService } from '../../src/services/sync-health-service';
import sequelize from '../../src/config/database';
import jwt from 'jsonwebtoken';
// Import mocks before mock declarations
import {
  sampleXmlData,
  mockModels,
  mockAxiosResponse,
  mockTransaction
} from '../mocks/geko-api-mocks';

// Create admin token for testing
const adminToken = jwt.sign(
  { userId: 'admin-test-id', email: 'admin@test.com', role: 'admin' },
  process.env.JWT_SECRET || 'test-jwt-secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);

describe('GEKO API Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockAxiosResponse);
  });

  describe('GekoDataService', () => {
    it('should fetch XML data from GEKO API', async () => {
      const tracking = SyncHealthService.startSyncTracking('test', 'https://api.geko.com/products');
      const result = await GekoDataService.fetchXmlData('https://api.geko.com/products', tracking);
      
      expect(axios.get).toHaveBeenCalledWith('https://api.geko.com/products', expect.any(Object));
      expect(result).toBeDefined();
      expect(result.data).toBe(sampleXmlData);
      expect(result.size).toBe(sampleXmlData.length);
    });

    it('should process XML data and persist to database', async () => {
      const tracking = SyncHealthService.startSyncTracking('test', 'https://api.geko.com/products');
      const stats = await GekoDataService.processXmlData(sampleXmlData, tracking);
      
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(stats).toBeDefined();
      
      // Verify model calls
      expect(mockModels.Product.upsert).toHaveBeenCalled();
      expect(mockModels.Category.upsert).toHaveBeenCalled();
      expect(mockModels.Producer.upsert).toHaveBeenCalled();
      expect(mockModels.Unit.upsert).toHaveBeenCalled();
      expect(mockModels.Variant.upsert).toHaveBeenCalled();
      expect(mockModels.Stock.upsert).toHaveBeenCalled();
      expect(mockModels.Price.upsert).toHaveBeenCalled();
      expect(mockModels.Image.upsert).toHaveBeenCalled();
    });

    it('should run a complete manual sync process', async () => {
      const result = await GekoDataService.runManualSync('https://api.geko.com/products');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(mockModels.SyncHealth.create).toHaveBeenCalled();
    });

    it('should handle errors during XML processing', async () => {
      // Mock an error in XML processing
      axios.get.mockRejectedValueOnce(new Error('API connection failed'));
      
      const result = await GekoDataService.runManualSync('https://api.geko.com/products');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('GEKO API Endpoints', () => {
    it('should require authentication for API endpoints', async () => {
      const res = await request(app).get('/api/geko/sync/status');
      expect(res.statusCode).toBe(401);
    });

    it('should require admin role for API endpoints', async () => {
      // Create non-admin token
      const userToken = jwt.sign(
        { userId: 'user-test-id', email: 'user@test.com', role: 'user' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      const res = await request(app)
        .get('/api/geko/sync/status')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(403);
    });

    it('should run manual sync with API endpoint', async () => {
      const res = await request(app)
        .post('/api/geko/sync/manual')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ apiUrl: 'https://api.geko.com/products' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
    });

    it('should get sync health records', async () => {
      // Mock SyncHealth.findAll to return test data
      mockModels.SyncHealth.findAll.mockResolvedValueOnce([
        {
          id: 1,
          sync_type: 'manual',
          status: 'success',
          start_time: new Date(),
          end_time: new Date(),
          duration_seconds: 2.5,
          api_url: 'https://api.geko.com/products',
          items_processed: {
            products: 2,
            categories: 1,
            producers: 1,
            units: 2,
            variants: 2,
            stocks: 2,
            prices: 2,
            images: 3
          },
          error_count: 0
        }
      ]);
      
      const res = await request(app)
        .get('/api/geko/health/recent')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should get sync health statistics', async () => {
      // Setup a date range
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const res = await request(app)
        .get('/api/geko/health/stats')
        .query({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.period).toBeDefined();
    });
  });

  describe('SyncHealthService', () => {
    it('should track sync process from start to finish', async () => {
      // Start tracking
      const tracking = SyncHealthService.startSyncTracking('test', 'https://api.geko.com/products');
      expect(tracking).toBeDefined();
      expect(tracking.trackingId).toBeDefined();
      expect(tracking.syncType).toBe('test');
      expect(tracking.apiUrl).toBe('https://api.geko.com/products');
      
      // Record some data
      SyncHealthService.updateItemsProcessed(tracking, 'products', 2);
      SyncHealthService.updateItemsProcessed(tracking, 'categories', 1);
      
      // Record an error
      SyncHealthService.recordError(tracking, 'TEST_ERROR', 'Test error message');
      expect(tracking.errors).toHaveLength(1);
      
      // Finish tracking
      const healthRecord = await SyncHealthService.finishSyncTracking(tracking, 'partial_success', 1024);
      expect(healthRecord).toBeDefined();
      expect(mockModels.SyncHealth.create).toHaveBeenCalledWith(expect.objectContaining({
        sync_type: 'test',
        status: 'partial_success',
        api_url: 'https://api.geko.com/products',
        request_size_bytes: 1024,
        error_count: 1
      }));
    });
  });
}); 