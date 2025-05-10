/**
 * Import Job Service
 * 
 * Manages background import jobs with status tracking
 */

import EventEmitter from 'events';
import logger from '../config/logger.js';

class ImportJobService {
  constructor() {
    this.jobs = new Map();
    this.eventEmitter = new EventEmitter();
  }
  
  /**
   * Create a new import job
   * @param {string} jobId - Unique ID for the job
   * @param {Object} metadata - Additional job metadata
   * @returns {Object} - Job information
   */
  createJob(jobId, metadata = {}) {
    if (this.jobs.has(jobId)) {
      throw new Error(`Job with ID ${jobId} already exists`);
    }
    
    const job = {
      id: jobId,
      status: 'created',
      progress: 0,
      created: new Date(),
      updated: new Date(),
      completed: null,
      error: null,
      metadata: {
        ...metadata
      },
      result: null
    };
    
    this.jobs.set(jobId, job);
    logger.info(`Created import job ${jobId}`);
    
    return job;
  }
  
  /**
   * Update a job's status and progress
   * @param {string} jobId - The job ID
   * @param {string} status - Current status
   * @param {number} progress - Progress (0-100)
   * @param {Object} additionalData - Additional data
   */
  updateJobStatus(jobId, status, progress, additionalData = {}) {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    const job = this.jobs.get(jobId);
    
    job.status = status;
    job.progress = progress;
    job.updated = new Date();
    
    // If job is complete or failed, set completed timestamp
    if (status === 'completed' || status === 'failed') {
      job.completed = new Date();
      
      if (status === 'failed' && additionalData.error) {
        job.error = additionalData.error;
      }
      
      if (status === 'completed' && additionalData.result) {
        job.result = additionalData.result;
      }
      
      // Schedule cleanup of old completed jobs (after 1 hour)
      setTimeout(() => {
        if (this.jobs.has(jobId)) {
          this.jobs.delete(jobId);
          logger.debug(`Cleaned up completed job ${jobId}`);
        }
      }, 60 * 60 * 1000);
    }
    
    // Merge additional data with job
    if (additionalData) {
      job.metadata = {
        ...job.metadata,
        ...additionalData
      };
    }
    
    // Emit update event
    this.eventEmitter.emit('job-updated', job);
    
    logger.debug(`Updated job ${jobId} status: ${status}, progress: ${progress}`);
    
    return job;
  }
  
  /**
   * Get a specific job by ID
   * @param {string} jobId - Job ID
   * @returns {Object|null} - Job information or null if not found
   */
  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }
  
  /**
   * List all active jobs
   * @param {Object} filters - Optional filters
   * @returns {Array} - Array of job objects
   */
  listJobs(filters = {}) {
    let jobs = Array.from(this.jobs.values());
    
    // Apply filters if provided
    if (filters.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }
    
    return jobs;
  }
  
  /**
   * Cancel a running job
   * @param {string} jobId - Job ID
   * @returns {boolean} - Success status
   */
  cancelJob(jobId) {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    const job = this.jobs.get(jobId);
    
    // Only cancel jobs that are in progress
    if (job.status !== 'processing' && job.status !== 'created') {
      throw new Error(`Cannot cancel job with status ${job.status}`);
    }
    
    job.status = 'cancelled';
    job.updated = new Date();
    job.completed = new Date();
    
    // Emit cancellation event that the processor can listen for
    this.eventEmitter.emit('job-cancelled', jobId);
    
    logger.info(`Cancelled import job ${jobId}`);
    
    return true;
  }
  
  /**
   * Subscribe to job update events
   * @param {function} callback - Callback function when job is updated
   * @returns {function} - Unsubscribe function
   */
  subscribeToJobUpdates(callback) {
    this.eventEmitter.on('job-updated', callback);
    
    // Return unsubscribe function
    return () => {
      this.eventEmitter.off('job-updated', callback);
    };
  }
  
  /**
   * Subscribe to job cancellation events
   * @param {function} callback - Callback function when job is cancelled
   * @returns {function} - Unsubscribe function
   */
  subscribeToJobCancellations(callback) {
    this.eventEmitter.on('job-cancelled', callback);
    
    // Return unsubscribe function
    return () => {
      this.eventEmitter.off('job-cancelled', callback);
    };
  }
}

// Singleton instance
const importJobService = new ImportJobService();

export default importJobService; 