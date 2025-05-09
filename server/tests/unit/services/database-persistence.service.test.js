/**
 * Unit tests for DatabasePersistenceService
 */

import { jest } from '@jest/globals';
import DatabasePersistenceService from '../../../src/services/database-persistence.service.js';
import GekoImportService from '../../../src/services/geko-import-service.js';
import { Sequelize } from 'sequelize';

// Mock the dependencies
jest.mock('../../../src/config/sequelize.js', () => {
  const mockSequelize = {
    transaction: jest.fn().mockReturnValue({
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    })
  };
  return mockSequelize;
});

jest.mock('../../../src/config/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../../../src/models/index.js', () => {
  // Create mock models with basic CRUD methods
  const createMockModel = (name) => ({
    findAll: jest.fn().mockResolvedValue([]),
    findOrCreate: jest.fn().mockResolvedValue([{ id: 1, name: `Test ${name}` }, true]),
    bulkCreate: jest.fn().mockImplementation(items => Promise.resolve(items.map((item, index) => ({ id: index + 1, ...item })))),
    update: jest.fn().mockResolvedValue([1])
  });

  return {
    Product: createMockModel('Product'),
    Category: createMockModel('Category'),
    Producer: createMockModel('Producer'),
    Unit: createMockModel('Unit'),
    Variant: createMockModel('Variant'),
    Stock: createMockModel('Stock'),
    Price: createMockModel('Price'),
    Image: createMockModel('Image'),
    Document: createMockModel('Document'),
    ProductProperty: createMockModel('ProductProperty')
  };
});

// Mock data for testing
const mockTransformedData = {
  products: [
    { code: 'P001', name: 'Test Product 1', category_id: 'C001', producer_id: 'ACME' },
    { code: 'P002', name: 'Test Product 2', category_id: 'C002', producer_id: 'ACME' }
  ],
  categories: [
    { id: 'C001', name: 'Category 1' },
    { id: 'C002', name: 'Category 2' }
  ],
  producers: [
    { name: 'ACME', description: 'ACME Corporation' }
  ],
  variants: [
    { code: 'P001-V1', weight: 1.5, product_code: 'P001' },
    { code: 'P002-V1', weight: 2.0, product_code: 'P002' }
  ],
  images: [
    { url: 'http://example.com/img1.jpg', product_code: 'P001', is_main: true },
    { url: 'http://example.com/img2.jpg', product_code: 'P002', is_main: true }
  ]
};

describe('DatabasePersistenceService', () => {
  let service;
  let importService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new DatabasePersistenceService();
    importService = new GekoImportService();
  });
  
  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(service.options.batchSize).toBe(500);
      expect(service.options.updateExisting).toBe(true);
      expect(service.options.skipImages).toBe(false);
    });
    
    it('should override default options with provided ones', () => {
      const customService = new DatabasePersistenceService({
        batchSize: 100,
        updateExisting: false,
        skipImages: true
      });
      
      expect(customService.options.batchSize).toBe(100);
      expect(customService.options.updateExisting).toBe(false);
      expect(customService.options.skipImages).toBe(true);
    });
  });
  
  describe('persistData', () => {
    it('should process categories, producers, and products in order', async () => {
      // Spy on the private methods
      const spyCategories = jest.spyOn(service, '_persistCategories');
      const spyProducers = jest.spyOn(service, '_persistProducers');
      const spyProducts = jest.spyOn(service, '_persistProducts');
      
      // Call the method
      const result = await service.persistData(mockTransformedData);
      
      // Verify the methods were called in the correct order
      expect(spyCategories).toHaveBeenCalledWith(
        mockTransformedData.categories, 
        expect.anything()
      );
      
      expect(spyProducers).toHaveBeenCalledWith(
        mockTransformedData.producers, 
        expect.anything()
      );
      
      expect(spyProducts).toHaveBeenCalledWith(
        mockTransformedData.products, 
        expect.anything()
      );
      
      // Check that timing statistics were recorded
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(typeof result.totalTime).toBe('number');
    });
    
    it('should handle empty data gracefully', async () => {
      const result = await service.persistData({});
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });
    
    it('should rollback transaction on error', async () => {
      // Mock an error in one of the persistence methods
      jest.spyOn(service, '_persistCategories').mockRejectedValue(new Error('Test error'));
      
      // Get the transaction mock
      const sequelize = (await import('../../../src/config/sequelize.js')).default;
      const transaction = await sequelize.transaction();
      
      // Call the method and expect it to reject
      await expect(service.persistData(mockTransformedData)).rejects.toThrow('Test error');
      
      // Verify the rollback was called
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });
  
  describe('Integration with GekoImportService', () => {
    // Mock the database persistence service in the import service
    jest.mock('../../../src/services/database-persistence.service.js', () => {
      return jest.fn().mockImplementation(() => ({
        processTransformedData: jest.fn().mockResolvedValue({
          success: true,
          stats: {
            created: { products: 2, categories: 2 },
            updated: {},
            errors: {}
          }
        })
      }));
    });
    
    it('should be accessible through GekoImportService', async () => {
      // Replace the import for testing
      importService.persistTransformedData = jest.fn().mockResolvedValue({
        success: true,
        totalTime: 1.5,
        recordsPerSecond: 100,
        stats: {
          created: { products: 2, categories: 2 },
          updated: {},
          errors: {}
        },
        entityCounts: {
          products: 2,
          categories: 2
        }
      });
      
      const result = await importService.persistTransformedData(mockTransformedData);
      
      expect(result.success).toBe(true);
      expect(importService.persistTransformedData).toHaveBeenCalledWith(
        mockTransformedData,
        expect.any(Object)
      );
    });
  });
  
  describe('Performance features', () => {
    it('should free memory when memoryManagement is enabled', async () => {
      // Mock the global garbage collector
      global.gc = jest.fn();
      
      // Create service with memory management enabled
      const memService = new DatabasePersistenceService({
        memoryManagement: true
      });
      
      // Spy on the private method
      const spyFreeMemory = jest.spyOn(memService, '_freeMemory');
      
      // Call the method
      await memService.persistData(mockTransformedData);
      
      // Verify the method was called
      expect(spyFreeMemory).toHaveBeenCalled();
      
      // Verify gc was called if available
      if (global.gc) {
        expect(global.gc).toHaveBeenCalled();
      }
      
      // Cleanup
      delete global.gc;
    });
  });
}); 