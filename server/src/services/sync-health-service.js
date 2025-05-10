import { SyncHealth } from '../models/sync-health.model.js';
import logger from '../config/logger.js';
import nodemailer from 'nodemailer';
import config from '../config/app-config.js';
import { Op } from 'sequelize';

/**
 * SyncHealthService
 * Service for monitoring and tracking the health of GEKO API synchronization
 */
class SyncHealthService {
  /**
   * Start tracking a new sync operation
   * @param {string} syncType - Type of sync (e.g., 'api', 'file_upload')
   * @param {string} apiUrl - API URL or file path
   * @returns {Object} Tracking object
   */
  static startSyncTracking(syncType, apiUrl) {
    console.log(`Starting sync tracking for ${syncType}: ${apiUrl}`);
    
    try {
      // Create tracking object
      const tracking = {
        syncType,
        apiUrl,
        startTime: new Date(),
        errors: [],
        errorCount: 0,
        recordId: null
      };

      // Create database record async
      // Note: We're not awaiting this to avoid blocking the import process
      this._createSyncRecord(tracking)
        .then(record => {
          if (record && record.id) {
            tracking.recordId = record.id;
            console.log(`Created sync health record with ID: ${record.id}`);
          }
        })
        .catch(error => {
          console.error('Error creating sync health record:', error);
        });

      return tracking;
    } catch (error) {
      console.error('Error in startSyncTracking:', error);
      // Return a basic tracking object even if DB operations fail
      return {
        syncType,
        apiUrl,
        startTime: new Date(),
        errors: [],
        errorCount: 0
      };
    }
  }

  /**
   * Create a sync record in the database
   * @param {Object} tracking - Tracking object
   * @returns {Promise<Object>} Created record
   * @private
   */
  static async _createSyncRecord(tracking) {
    try {
      // Create record in database
      const record = await SyncHealth.create({
        sync_type: tracking.syncType,
        status: 'in_progress',
        start_time: tracking.startTime,
        api_url: tracking.apiUrl,
        error_count: 0,
        errors: []
      });
      
      return record;
    } catch (error) {
      console.error('Error creating sync health record:', error);
      return null;
    }
  }

  /**
   * Record an error during sync
   * @param {Object} tracking - Tracking object
   * @param {string} errorType - Type of error
   * @param {string} errorMessage - Error message
   * @param {Object} details - Additional error details
   */
  static recordError(tracking, errorType, errorMessage, details = {}) {
    if (!tracking) return;
    
    console.error(`Sync error (${errorType}): ${errorMessage}`);
    
    try {
      // Add error to tracking object
      const error = {
        type: errorType,
        message: errorMessage,
        timestamp: new Date(),
        details: details
      };
      
      if (Array.isArray(tracking.errors)) {
        tracking.errors.push(error);
      } else {
        tracking.errors = [error];
      }
      
      tracking.errorCount = (tracking.errorCount || 0) + 1;
      
      // Update database record if available
      if (tracking.recordId) {
        this._updateSyncRecord(tracking.recordId, {
          error_count: tracking.errorCount,
          errors: tracking.errors
        }).catch(err => console.error('Error updating sync record with error:', err));
      }
    } catch (err) {
      console.error('Error in recordError:', err);
    }
  }

  /**
   * Finish tracking a sync operation
   * @param {Object} tracking - Tracking object
   * @param {string} status - Final status ('success', 'partial_success', 'error')
   * @param {number} requestSizeBytes - Size of processed data in bytes
   * @param {Object} itemsProcessed - Counts of processed items by type
   */
  static finishSyncTracking(tracking, status, requestSizeBytes = 0, itemsProcessed = {}) {
    if (!tracking) return;
    
    console.log(`Finishing sync tracking for ${tracking.syncType} with status: ${status}`);
    
    try {
      // Calculate duration
      const endTime = new Date();
      const durationSeconds = (endTime - tracking.startTime) / 1000;
      
      console.log(`Sync duration: ${durationSeconds.toFixed(2)} seconds`);
      
      // Update tracking object
      tracking.endTime = endTime;
      tracking.durationSeconds = durationSeconds;
      tracking.status = status;
      tracking.requestSizeBytes = requestSizeBytes;
      tracking.itemsProcessed = itemsProcessed;
      
      // Update database record if available
      if (tracking.recordId) {
        this._updateSyncRecord(tracking.recordId, {
          status: status,
          end_time: endTime,
          duration_seconds: durationSeconds,
          request_size_bytes: requestSizeBytes,
          items_processed: itemsProcessed
        }).catch(err => console.error('Error updating sync record on finish:', err));
      }
      
      return tracking;
    } catch (error) {
      console.error('Error in finishSyncTracking:', error);
      return tracking;
    }
  }

  /**
   * Update a sync record in the database
   * @param {number} recordId - ID of the record to update
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated record
   * @private
   */
  static async _updateSyncRecord(recordId, data) {
    try {
      const record = await SyncHealth.findByPk(recordId);
      if (!record) {
        console.error(`Sync health record not found: ${recordId}`);
        return null;
      }
      
      await record.update(data);
      return record;
    } catch (error) {
      console.error('Error updating sync health record:', error);
      return null;
    }
  }

  /**
   * Get recent sync health records
   * @param {number} limit - Maximum number of records to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} - Array of health records
   */
  static async getRecentSyncHealth(limit = 10, offset = 0) {
    try {
      return await SyncHealth.findAll({
        order: [['start_time', 'DESC']],
        limit,
        offset
      });
    } catch (error) {
      logger.error(`Failed to get recent sync health records: ${error.message}`);
      return [];
    }
  }

  /**
   * Get health statistics for a time period
   * @param {Date} startDate - Start date for stats
   * @param {Date} endDate - End date for stats
   * @returns {Promise<Object>} - Health statistics
   */
  static async getHealthStats(startDate, endDate) {
    try {
      const records = await SyncHealth.findAll({
        where: {
          start_time: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      if (!records.length) {
        return {
          totalSyncs: 0,
          successRate: 0,
          avgDuration: 0,
          totalErrors: 0,
          itemsProcessed: {}
        };
      }
      
      // Calculate statistics
      const totalSyncs = records.length;
      const successfulSyncs = records.filter(r => r.status === 'success').length;
      const successRate = (successfulSyncs / totalSyncs) * 100;
      const totalErrors = records.reduce((sum, r) => sum + r.error_count, 0);
      const avgDuration = records.reduce((sum, r) => sum + r.duration_seconds, 0) / totalSyncs;
      
      // Aggregate items processed
      const itemsProcessed = {};
      records.forEach(record => {
        Object.entries(record.items_processed).forEach(([key, value]) => {
          itemsProcessed[key] = (itemsProcessed[key] || 0) + value;
        });
      });
      
      return {
        totalSyncs,
        successRate,
        avgDuration,
        totalErrors,
        itemsProcessed
      };
    } catch (error) {
      logger.error(`Failed to get sync health statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Send alerts for failed or partially successful syncs
   * @param {Object} healthRecord - The sync health record
   * @private
   */
  static async sendAlerts(healthRecord) {
    // Only send alerts in production or if explicitly enabled in other environments
    if (process.env.NODE_ENV !== 'production' && !config.syncHealth?.alertsEnabled) {
      logger.info('Sync health alerts are disabled in this environment');
      return;
    }
    
    try {
      // Check if alerts are configured
      if (!config.syncHealth?.alertEmail?.to) {
        logger.warn('Sync health alert email recipient not configured');
        return;
      }
      
      // Create subject line based on status
      const subject = `[AliTools] GEKO API Sync ${healthRecord.status === 'failed' ? 'FAILURE' : 'WARNING'} - ${new Date().toISOString()}`;
      
      // Create email body
      const errorDetails = healthRecord.error_details ? 
        healthRecord.error_details.map(err => `- ${err.type}: ${err.message}`).join('\n') : 
        'No detailed error information available';
      
      const body = `
        <h2>GEKO API Sync ${healthRecord.status.toUpperCase()}</h2>
        <p><strong>Sync ID:</strong> ${healthRecord.id}</p>
        <p><strong>Type:</strong> ${healthRecord.sync_type}</p>
        <p><strong>Started:</strong> ${healthRecord.start_time}</p>
        <p><strong>Duration:</strong> ${healthRecord.duration_seconds.toFixed(2)} seconds</p>
        <p><strong>API URL:</strong> ${healthRecord.api_url}</p>
        <p><strong>Error Count:</strong> ${healthRecord.error_count}</p>
        
        <h3>Error Details:</h3>
        <pre>${errorDetails}</pre>
        
        <h3>Items Processed:</h3>
        <pre>${JSON.stringify(healthRecord.items_processed, null, 2)}</pre>
      `;
      
      // Send email alert
      await this._sendEmail(subject, body);
      
      logger.info(`Sent sync health alert email for sync ID ${healthRecord.id}`);
    } catch (error) {
      logger.error(`Failed to send sync health alert: ${error.message}`);
    }
  }

  /**
   * Send email using configured transport
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML)
   * @private
   */
  static async _sendEmail(subject, body) {
    // Create transport
    const transport = nodemailer.createTransport({
      host: config.syncHealth.alertEmail.host,
      port: config.syncHealth.alertEmail.port,
      secure: config.syncHealth.alertEmail.secure,
      auth: {
        user: config.syncHealth.alertEmail.user,
        pass: config.syncHealth.alertEmail.password
      }
    });
    
    // Send mail
    await transport.sendMail({
      from: config.syncHealth.alertEmail.from,
      to: config.syncHealth.alertEmail.to,
      subject,
      html: body
    });
  }
}

export default SyncHealthService; 