import { SyncHealth } from '../models';
import { logger } from '../config/logger';
import nodemailer from 'nodemailer';
import config from '../config/app-config';
import { Op } from 'sequelize';

/**
 * SyncHealthService
 * Service for monitoring and tracking the health of GEKO API synchronization
 */
export class SyncHealthService {
  /**
   * Start tracking a new sync operation
   * @param {string} syncType - Type of sync ('scheduled' or 'manual')
   * @param {string} apiUrl - The API URL being used
   * @returns {Object} - Sync tracking object
   */
  static startSyncTracking(syncType, apiUrl) {
    const startTime = new Date();
    const trackingId = Date.now();

    logger.info(`Starting sync health tracking (ID: ${trackingId}) for ${syncType} sync`);

    return {
      trackingId,
      syncType,
      apiUrl,
      startTime,
      errors: [],
      itemsProcessed: {}
    };
  }

  /**
   * Record error during sync process
   * @param {Object} tracking - Sync tracking object
   * @param {string} errorType - Type of error
   * @param {string} errorMessage - Error message
   * @param {Object} details - Additional error details
   */
  static recordError(tracking, errorType, errorMessage, details = {}) {
    if (!tracking) return;

    logger.error(`Sync error (ID: ${tracking.trackingId}): [${errorType}] ${errorMessage}`);
    
    tracking.errors.push({
      type: errorType,
      message: errorMessage,
      timestamp: new Date(),
      details
    });
  }

  /**
   * Update item processing counts
   * @param {Object} tracking - Sync tracking object
   * @param {string} itemType - Type of item (e.g., 'products', 'categories')
   * @param {number} count - Number of items processed
   */
  static updateItemsProcessed(tracking, itemType, count) {
    if (!tracking) return;
    
    tracking.itemsProcessed[itemType] = (tracking.itemsProcessed[itemType] || 0) + count;
    logger.debug(`Sync (ID: ${tracking.trackingId}): Processed ${count} ${itemType}`);
  }

  /**
   * Finish sync tracking and save results to database
   * @param {Object} tracking - Sync tracking object
   * @param {string} status - Final status ('success', 'partial_success', 'failed')
   * @param {number} requestSizeBytes - Size of the request in bytes
   * @returns {Promise<Object>} - The created SyncHealth record
   */
  static async finishSyncTracking(tracking, status, requestSizeBytes = null) {
    if (!tracking) return null;
    
    const endTime = new Date();
    const durationSeconds = (endTime - tracking.startTime) / 1000;
    
    logger.info(`Finishing sync health tracking (ID: ${tracking.trackingId}), status: ${status}, duration: ${durationSeconds}s`);
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
    
    try {
      // Create health record
      const healthRecord = await SyncHealth.create({
        sync_type: tracking.syncType,
        status,
        start_time: tracking.startTime,
        end_time: endTime,
        duration_seconds: durationSeconds,
        api_url: tracking.apiUrl,
        request_size_bytes: requestSizeBytes,
        items_processed: tracking.itemsProcessed,
        error_count: tracking.errors.length,
        error_details: tracking.errors.length > 0 ? tracking.errors : null,
        memory_usage_mb: memoryUsageMB
      });
      
      // Send alerts if needed
      if (status === 'failed' || (status === 'partial_success' && tracking.errors.length > 0)) {
        this.sendAlerts(healthRecord);
      }
      
      return healthRecord;
    } catch (error) {
      logger.error(`Failed to save sync health record (ID: ${tracking.trackingId}): ${error.message}`);
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