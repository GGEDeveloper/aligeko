import express from 'express';
import gekoApiController from '../controllers/geko-api.controller.js';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';


const router = express.Router();

/**
 * GEKO API routes
 * All routes require admin authentication
 * Base path: /api/geko-api
 */

/**
 * @route POST /api/geko-api/start-sync
 * @description Start scheduled synchronization with GEKO API
 * @access Private (Admin only)
 */
router.post('/start-sync', checkAuth, checkRole(['admin']), gekoApiController.startScheduledSync);

/**
 * @route POST /api/geko-api/stop-sync
 * @description Stop scheduled synchronization with GEKO API
 * @access Private (Admin only)
 */
router.post('/stop-sync', checkAuth, checkRole(['admin']), gekoApiController.stopScheduledSync);

/**
 * @route GET /api/geko-api/sync-status
 * @description Get the status of scheduled synchronization with GEKO API
 * @access Private (Admin only)
 */
router.get('/sync-status', checkAuth, checkRole(['admin']), gekoApiController.getScheduledSyncStatus);

/**
 * @route POST /api/geko-api/manual-sync
 * @description Run a manual synchronization with GEKO API
 * @access Private (Admin only)
 */
router.post('/manual-sync', checkAuth, checkRole(['admin']), gekoApiController.runManualSync);

/**
 * @swagger
 * /api/geko/sync/start:
 *   post:
 *     description: Start scheduled synchronization with GEKO API
 *     tags: [GEKO]
 */
router.post(
  '/sync/start',
  checkAuth, checkRole(['admin']),
  gekoApiController.startScheduledSync
);

/**
 * @swagger
 * /api/geko/sync/stop:
 *   post:
 *     description: Stop scheduled synchronization with GEKO API
 *     tags: [GEKO]
 */
router.post(
  '/sync/stop',
  checkAuth, checkRole(['admin']),
  gekoApiController.stopScheduledSync
);

/**
 * @swagger
 * /api/geko/sync/status:
 *   get:
 *     description: Get status of scheduled synchronization with GEKO API
 *     tags: [GEKO]
 */
router.get(
  '/sync/status',
  checkAuth, checkRole(['admin']),
  gekoApiController.getScheduledSyncStatus
);

/**
 * @swagger
 * /api/geko/sync/manual:
 *   post:
 *     description: Run manual synchronization with GEKO API
 *     tags: [GEKO]
 */
router.post(
  '/sync/manual',
  checkAuth, checkRole(['admin']),
  gekoApiController.runManualSync
);

/**
 * @swagger
 * /api/geko/health/recent:
 *   get:
 *     description: Get recent health records for GEKO API synchronization
 *     tags: [GEKO]
 */
router.get(
  '/health/recent',
  checkAuth, checkRole(['admin']),
  gekoApiController.getRecentSyncHealth
);

/**
 * @swagger
 * /api/geko/health/stats:
 *   get:
 *     description: Get health statistics for GEKO API synchronization
 *     tags: [GEKO]
 */
router.get(
  '/health/stats',
  checkAuth, checkRole(['admin']),
  gekoApiController.getSyncHealthStats
);

export default router; 