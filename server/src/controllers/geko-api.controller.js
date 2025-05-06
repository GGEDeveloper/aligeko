import { GekoDataService } from '../services/geko-data-service';
import { SyncHealthService } from '../services/sync-health-service';
import { logger } from '../config/logger';
import config from '../config/config';
import { Op } from 'sequelize';

// Scheduled sync task reference
let scheduledSyncTask = null;

/**
 * GEKO API Controller
 * Exposes endpoints for manual sync and sync status management
 */
export default {
  /**
   * Start the scheduled sync with GEKO API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  startScheduledSync: async (req, res) => {
    try {
      const apiUrl = req.body.apiUrl || config.gekoApi.url;
      const intervalMinutes = req.body.intervalMinutes || config.gekoApi.syncIntervalMinutes || 30;
      
      // Stop existing scheduled task if it exists
      if (scheduledSyncTask && scheduledSyncTask.task) {
        scheduledSyncTask.task.stop();
        logger.info('Stopped existing GEKO API sync schedule');
      }
      
      // Start new scheduled task
      scheduledSyncTask = GekoDataService.scheduleSync(apiUrl, intervalMinutes);
      
      logger.info(`Started scheduled GEKO API sync every ${intervalMinutes} minutes with URL: ${apiUrl}`);
      
      return res.status(200).json({
        success: true,
        message: `Scheduled GEKO API sync started. Will sync every ${intervalMinutes} minutes.`,
        schedule: {
          expression: scheduledSyncTask.expression,
          intervalMinutes: scheduledSyncTask.intervalMinutes
        }
      });
    } catch (error) {
      logger.error(`Error starting scheduled GEKO API sync: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to start scheduled GEKO API sync',
        error: error.message
      });
    }
  },
  
  /**
   * Stop the scheduled sync with GEKO API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  stopScheduledSync: async (req, res) => {
    try {
      if (scheduledSyncTask && scheduledSyncTask.task) {
        scheduledSyncTask.task.stop();
        scheduledSyncTask = null;
        
        logger.info('Stopped scheduled GEKO API sync');
        
        return res.status(200).json({
          success: true,
          message: 'Scheduled GEKO API sync stopped'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'No scheduled GEKO API sync was running'
      });
    } catch (error) {
      logger.error(`Error stopping scheduled GEKO API sync: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to stop scheduled GEKO API sync',
        error: error.message
      });
    }
  },
  
  /**
   * Get the status of the scheduled sync with GEKO API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getScheduledSyncStatus: async (req, res) => {
    try {
      if (scheduledSyncTask && scheduledSyncTask.task) {
        return res.status(200).json({
          success: true,
          isRunning: true,
          schedule: {
            expression: scheduledSyncTask.expression,
            intervalMinutes: scheduledSyncTask.intervalMinutes
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        isRunning: false
      });
    } catch (error) {
      logger.error(`Error getting scheduled GEKO API sync status: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get scheduled GEKO API sync status',
        error: error.message
      });
    }
  },
  
  /**
   * Run a manual sync with GEKO API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  runManualSync: async (req, res) => {
    try {
      const apiUrl = req.body.apiUrl || config.gekoApi.url;
      
      logger.info(`Running manual GEKO API sync with URL: ${apiUrl}`);
      
      // Run manual sync
      const result = await GekoDataService.runManualSync(apiUrl);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: `Manual GEKO API sync completed in ${result.duration} seconds`,
          stats: result.stats
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Manual GEKO API sync failed',
        error: result.error
      });
    } catch (error) {
      logger.error(`Error running manual GEKO API sync: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to run manual GEKO API sync',
        error: error.message
      });
    }
  },

  /**
   * Get recent sync health records
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRecentSyncHealth: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      
      // Get recent health records
      const healthRecords = await SyncHealthService.getRecentSyncHealth(limit, offset);
      
      return res.status(200).json({
        success: true,
        data: healthRecords
      });
    } catch (error) {
      logger.error(`Error getting sync health records: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get sync health records',
        error: error.message
      });
    }
  },

  /**
   * Get sync health statistics for a time period
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSyncHealthStats: async (req, res) => {
    try {
      // Default to last 7 days if no dates provided
      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const startDate = req.query.startDate ? 
                        new Date(req.query.startDate) : 
                        new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days
      
      // Get health statistics
      const stats = await SyncHealthService.getHealthStats(startDate, endDate);
      
      if (!stats) {
        return res.status(500).json({
          success: false,
          message: 'Failed to get sync health statistics'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...stats,
          period: {
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      logger.error(`Error getting sync health statistics: ${error.message}`);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get sync health statistics',
        error: error.message
      });
    }
  }
}; 