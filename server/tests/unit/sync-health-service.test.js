import { SyncHealthService } from '../../src/services/sync-health-service';
import { SyncHealth } from '../../src/models';
import { logger } from '../../src/config/logger';
import nodemailer from 'nodemailer';

// Mock models and dependencies
jest.mock('../../src/models', () => ({
  SyncHealth: {
    create: jest.fn(),
    findAll: jest.fn()
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

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true)
  }))
}));

describe('SyncHealthService', () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  describe('startSyncTracking', () => {
    it('should create a tracking object with the correct properties', () => {
      const apiUrl = 'https://api.geko.com/products';
      const syncType = 'scheduled';
      
      const tracking = SyncHealthService.startSyncTracking(syncType, apiUrl);
      
      expect(tracking).toHaveProperty('trackingId');
      expect(tracking).toHaveProperty('syncType', syncType);
      expect(tracking).toHaveProperty('apiUrl', apiUrl);
      expect(tracking).toHaveProperty('startTime');
      expect(tracking).toHaveProperty('errors', []);
      expect(tracking).toHaveProperty('itemsProcessed', {});
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('recordError', () => {
    it('should add an error to the tracking object', () => {
      const tracking = {
        trackingId: 123,
        errors: []
      };
      
      const errorType = 'API_ERROR';
      const errorMessage = 'Connection failed';
      const details = { statusCode: 500 };
      
      SyncHealthService.recordError(tracking, errorType, errorMessage, details);
      
      expect(tracking.errors.length).toBe(1);
      expect(tracking.errors[0]).toHaveProperty('type', errorType);
      expect(tracking.errors[0]).toHaveProperty('message', errorMessage);
      expect(tracking.errors[0]).toHaveProperty('details', details);
      expect(tracking.errors[0]).toHaveProperty('timestamp');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should not throw if tracking is null', () => {
      expect(() => {
        SyncHealthService.recordError(null, 'ERROR', 'Test error');
      }).not.toThrow();
    });
  });

  describe('updateItemsProcessed', () => {
    it('should update the itemsProcessed object correctly', () => {
      const tracking = {
        trackingId: 123,
        itemsProcessed: {}
      };
      
      SyncHealthService.updateItemsProcessed(tracking, 'products', 10);
      expect(tracking.itemsProcessed).toHaveProperty('products', 10);
      
      // Add more items
      SyncHealthService.updateItemsProcessed(tracking, 'categories', 5);
      expect(tracking.itemsProcessed).toHaveProperty('categories', 5);
      
      // Increment existing item
      SyncHealthService.updateItemsProcessed(tracking, 'products', 5);
      expect(tracking.itemsProcessed).toHaveProperty('products', 15);
      
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });

    it('should not throw if tracking is null', () => {
      expect(() => {
        SyncHealthService.updateItemsProcessed(null, 'products', 10);
      }).not.toThrow();
    });
  });

  describe('finishSyncTracking', () => {
    it('should create a SyncHealth record with the correct data', async () => {
      const tracking = {
        trackingId: 123,
        syncType: 'manual',
        apiUrl: 'https://api.geko.com/products',
        startTime: new Date(Date.now() - 5000), // 5 seconds ago
        errors: [],
        itemsProcessed: { products: 10, categories: 5 }
      };
      
      const mockHealthRecord = {
        id: 1,
        sync_type: tracking.syncType,
        status: 'success',
        items_processed: tracking.itemsProcessed
      };
      
      SyncHealth.create.mockResolvedValue(mockHealthRecord);
      
      const result = await SyncHealthService.finishSyncTracking(tracking, 'success', 1024);
      
      expect(SyncHealth.create).toHaveBeenCalledTimes(1);
      expect(SyncHealth.create).toHaveBeenCalledWith(expect.objectContaining({
        sync_type: tracking.syncType,
        status: 'success',
        api_url: tracking.apiUrl,
        request_size_bytes: 1024,
        items_processed: tracking.itemsProcessed,
        error_count: 0,
        error_details: null,
      }));
      
      expect(result).toEqual(mockHealthRecord);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should include error details if there are errors', async () => {
      const tracking = {
        trackingId: 123,
        syncType: 'manual',
        apiUrl: 'https://api.geko.com/products',
        startTime: new Date(Date.now() - 5000), // 5 seconds ago
        errors: [
          { type: 'API_ERROR', message: 'Connection failed', timestamp: new Date() }
        ],
        itemsProcessed: { products: 5 }
      };
      
      const mockHealthRecord = {
        id: 1,
        sync_type: tracking.syncType,
        status: 'partial_success',
        items_processed: tracking.itemsProcessed,
        error_count: 1,
        error_details: tracking.errors
      };
      
      SyncHealth.create.mockResolvedValue(mockHealthRecord);
      
      const result = await SyncHealthService.finishSyncTracking(tracking, 'partial_success', 1024);
      
      expect(SyncHealth.create).toHaveBeenCalledWith(expect.objectContaining({
        error_count: 1,
        error_details: tracking.errors,
      }));
      
      expect(result).toEqual(mockHealthRecord);
    });

    it('should return null if tracking is null', async () => {
      const result = await SyncHealthService.finishSyncTracking(null, 'success');
      expect(result).toBeNull();
    });

    it('should handle errors during record creation', async () => {
      const tracking = {
        trackingId: 123,
        syncType: 'manual',
        apiUrl: 'https://api.geko.com/products',
        startTime: new Date(Date.now() - 5000),
        errors: [],
        itemsProcessed: {}
      };
      
      SyncHealth.create.mockRejectedValue(new Error('Database error'));
      
      const result = await SyncHealthService.finishSyncTracking(tracking, 'success');
      
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getRecentSyncHealth', () => {
    it('should return recent health records', async () => {
      const mockRecords = [
        { id: 1, status: 'success' },
        { id: 2, status: 'failed' }
      ];
      
      SyncHealth.findAll.mockResolvedValue(mockRecords);
      
      const result = await SyncHealthService.getRecentSyncHealth(2, 0);
      
      expect(SyncHealth.findAll).toHaveBeenCalledWith({
        order: [['start_time', 'DESC']],
        limit: 2,
        offset: 0
      });
      
      expect(result).toEqual(mockRecords);
    });

    it('should handle errors and return empty array', async () => {
      SyncHealth.findAll.mockRejectedValue(new Error('Database error'));
      
      const result = await SyncHealthService.getRecentSyncHealth();
      
      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 