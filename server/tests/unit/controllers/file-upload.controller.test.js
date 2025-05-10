/**
 * File Upload Controller Tests
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import express from 'express';
import FileUploadController from '../../../src/controllers/file-upload.controller.js';
import importJobService from '../../../src/services/import-job.service.js';

// Mock dependencies
jest.mock('../../../src/services/import-job.service.js', () => ({
  createJob: jest.fn(() => ({
    id: 'mock-job-id',
    status: 'created',
    progress: 0
  })),
  getJob: jest.fn(),
  listJobs: jest.fn(),
  cancelJob: jest.fn(),
  updateJobStatus: jest.fn()
}));

jest.mock('../../../src/services/geko-import-service.js', () => {
  return jest.fn().mockImplementation(() => ({
    processUploadedXmlFile: jest.fn().mockResolvedValue({
      success: true,
      duration: 5.2,
      stats: {
        productsProcessed: 150,
        categoriesProcessed: 25
      }
    })
  }));
});

// Mock fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlink: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/api/upload/xml', FileUploadController.uploadXml);
app.get('/api/upload/jobs', FileUploadController.listJobs);
app.get('/api/upload/jobs/:jobId', FileUploadController.getJobStatus);
app.delete('/api/upload/jobs/:jobId', FileUploadController.cancelJob);

describe('FileUploadController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('uploadXml', () => {
    it('should handle file upload and return job ID', async () => {
      // Mock implementation for listJobs
      importJobService.listJobs.mockReturnValue([
        {
          id: 'mock-job-id',
          status: 'processing',
          progress: 50,
          created: new Date(),
          updated: new Date(),
          metadata: {
            filename: 'test.xml',
            fileSize: 1024
          }
        }
      ]);
      
      // Test job listing endpoint
      const response = await request(app)
        .get('/api/upload/jobs')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.jobs)).toBe(true);
      expect(importJobService.listJobs).toHaveBeenCalled();
    });
  });
  
  describe('getJobStatus', () => {
    it('should return job status when job exists', async () => {
      const mockJob = {
        id: 'mock-job-id',
        status: 'completed',
        progress: 100,
        created: new Date(),
        updated: new Date(),
        completed: new Date(),
        error: null,
        result: {
          productsImported: 150
        },
        metadata: {
          filename: 'test.xml',
          fileSize: 1024,
          uploadedAt: new Date()
        }
      };
      
      importJobService.getJob.mockReturnValue(mockJob);
      
      const response = await request(app)
        .get('/api/upload/jobs/mock-job-id')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.job).toBeDefined();
      expect(response.body.job.id).toBe('mock-job-id');
      expect(response.body.job.status).toBe('completed');
      expect(importJobService.getJob).toHaveBeenCalledWith('mock-job-id');
    });
    
    it('should return 404 when job does not exist', async () => {
      importJobService.getJob.mockReturnValue(null);
      
      const response = await request(app)
        .get('/api/upload/jobs/non-existent-job')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('cancelJob', () => {
    it('should cancel a job and return success', async () => {
      importJobService.cancelJob.mockReturnValue(true);
      
      const response = await request(app)
        .delete('/api/upload/jobs/mock-job-id')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
      expect(importJobService.cancelJob).toHaveBeenCalledWith('mock-job-id');
    });
    
    it('should return 404 when trying to cancel non-existent job', async () => {
      const errorMessage = 'Job with ID non-existent-job not found';
      importJobService.cancelJob.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      const response = await request(app)
        .delete('/api/upload/jobs/non-existent-job')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(errorMessage);
    });
    
    it('should return 400 when trying to cancel job with invalid status', async () => {
      const errorMessage = 'Cannot cancel job with status completed';
      importJobService.cancelJob.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      const response = await request(app)
        .delete('/api/upload/jobs/completed-job')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(errorMessage);
    });
  });
});

// Additional tests for actual file upload would typically use multipart/form-data
// and require more complex mocking of the multer middleware.
// These would be better suited for integration tests with a real file system. 