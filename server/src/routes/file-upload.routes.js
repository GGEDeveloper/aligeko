/**
 * File Upload Routes
 * 
 * API endpoints for file upload and import operations
 */

import express from 'express';
import FileUploadController from '../controllers/file-upload.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import uploadSecurityMiddleware from '../middleware/upload-security.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkAuth);

// POST /api/upload/xml - Upload XML file
// Apply upload security middleware only to upload endpoint
router.post('/xml', uploadSecurityMiddleware, FileUploadController.uploadXml);

// GET /api/upload/jobs - List all active jobs
router.get('/jobs', FileUploadController.listJobs);

// GET /api/upload/jobs/:jobId - Get job status
router.get('/jobs/:jobId', FileUploadController.getJobStatus);

// DELETE /api/upload/jobs/:jobId - Cancel job
router.delete('/jobs/:jobId', FileUploadController.cancelJob);

export default router; 