/**
 * File Upload Controller
 * 
 * Handles XML file uploads and processing for product imports
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import GekoImportService from '../services/geko-import-service.js';
import importJobService from '../services/import-job.service.js';

// Use __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for XML files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || 
      file.originalname.toLowerCase().endsWith('.xml')) {
    cb(null, true);
  } else {
    cb(new Error('Only XML files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max size
  }
}).single('xmlFile');

// Create Geko Import Service instance
const gekoImportService = new GekoImportService();

const FileUploadController = {
  /**
   * Upload XML file 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadXml: (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        logger.error(`File upload error: ${err.message}`);
        return res.status(400).json({ 
          success: false, 
          message: `File upload failed: ${err.message}` 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      try {
        // Create a job ID for tracking
        const jobId = uuidv4();
        
        // Create a job in the ImportJobService
        importJobService.createJob(jobId, {
          filename: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          uploadedBy: req.user?.id || 'unknown',
          uploadedAt: new Date()
        });
        
        // Start processing in the background
        processFileInBackground(jobId, req.file.path, req.body);
        
        // Return success with job ID for tracking
        return res.status(200).json({
          success: true,
          message: 'File uploaded successfully and queued for processing',
          jobId
        });
      } catch (error) {
        logger.error(`Error initiating import job: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: `Failed to initiate import: ${error.message}`
        });
      }
    });
  },
  
  /**
   * List all active import jobs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  listJobs: (req, res) => {
    try {
      const jobs = importJobService.listJobs();
      
      // Filter out sensitive information
      const jobsSummary = jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        created: job.created,
        updated: job.updated,
        completed: job.completed,
        filename: job.metadata.filename,
        fileSize: job.metadata.fileSize,
        uploadedAt: job.metadata.uploadedAt
      }));
      
      return res.status(200).json({
        success: true,
        jobs: jobsSummary
      });
    } catch (error) {
      logger.error(`Error listing jobs: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to list jobs: ${error.message}`
      });
    }
  },
  
  /**
   * Get status of a specific job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getJobStatus: (req, res) => {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        });
      }
      
      const job = importJobService.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job with ID ${jobId} not found`
        });
      }
      
      // Filter out sensitive information
      const jobSummary = {
        id: job.id,
        status: job.status,
        progress: job.progress,
        created: job.created,
        updated: job.updated,
        completed: job.completed,
        filename: job.metadata.filename,
        fileSize: job.metadata.fileSize,
        uploadedAt: job.metadata.uploadedAt,
        error: job.error,
        result: job.result
      };
      
      return res.status(200).json({
        success: true,
        job: jobSummary
      });
    } catch (error) {
      logger.error(`Error getting job status: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to get job status: ${error.message}`
      });
    }
  },
  
  /**
   * Cancel a running job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  cancelJob: (req, res) => {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        });
      }
      
      importJobService.cancelJob(jobId);
      
      return res.status(200).json({
        success: true,
        message: `Job ${jobId} has been cancelled`
      });
    } catch (error) {
      logger.error(`Error cancelling job: ${error.message}`);
      
      // If job not found or cannot be cancelled, return 404/400
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: `Failed to cancel job: ${error.message}`
      });
    }
  }
};

/**
 * Process file in background
 * @param {string} jobId - Job ID
 * @param {string} filePath - Path to uploaded file
 * @param {Object} options - Import options
 */
function processFileInBackground(jobId, filePath, options = {}) {
  // Update job status to processing
  importJobService.updateJobStatus(jobId, 'processing', 0);
  
  // Flag to track if job was cancelled
  let isCancelled = false;
  
  // Subscribe to job cancellation events
  const unsubscribe = importJobService.subscribeToJobCancellations((cancelledJobId) => {
    if (cancelledJobId === jobId) {
      isCancelled = true;
    }
  });
  
  // Start processing in a non-blocking way
  setTimeout(async () => {
    try {
      // Check if job is already cancelled
      if (isCancelled) {
        logger.info(`Job ${jobId} was cancelled before processing started`);
        unsubscribe();
        return;
      }
      
      // Progress callback function
      const progressCallback = (progress, stage) => {
        // Check for cancellation
        if (isCancelled) {
          throw new Error('Job was cancelled');
        }
        
        importJobService.updateJobStatus(jobId, 'processing', progress, { stage });
      };
      
      // Process the file
      logger.info(`Starting import job ${jobId} for file ${filePath}`);
      
      // Set initial progress
      progressCallback(5, 'Starting import process');
      
      // Process the file with the appropriate options
      const result = await gekoImportService.processUploadedXmlFile(filePath, {
        skipImages: options.skipImages === 'true',
        progressCallback
      });
      
      // Update job status to completed
      importJobService.updateJobStatus(jobId, 'completed', 100, { result });
      
      logger.info(`Import job ${jobId} completed successfully`);
    } catch (error) {
      logger.error(`Error in import job ${jobId}: ${error.message}`);
      
      // Update job status to failed
      importJobService.updateJobStatus(jobId, 'failed', 0, { error: error.message });
    } finally {
      // Clean up the subscription
      unsubscribe();
      
      // Delete the temporary file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.debug(`Deleted temporary file ${filePath}`);
        }
      } catch (err) {
        logger.error(`Error deleting temporary file ${filePath}: ${err.message}`);
      }
    }
  }, 0);
}

export default FileUploadController; 