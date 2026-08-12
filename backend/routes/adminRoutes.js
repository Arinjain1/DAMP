import express from 'express';
import { 
  getStats, 
  getBrokers, 
  updateBrokerStatus, 
  getBrokerActivity,
  getAnalytics,
  getAuditLogs,
  getTransactions, 
  refundTransaction,
  getProperties, 
  updatePropertyStatus 
} from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection and admin verification to all admin routes
router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', getStats);
router.get('/brokers', getBrokers);
router.put('/brokers/:id/status', updateBrokerStatus);
router.get('/brokers/:id/activity', getBrokerActivity);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/transactions', getTransactions);
router.put('/transactions/:id/refund', refundTransaction);
router.get('/properties', getProperties);
router.put('/properties/:id/status', updatePropertyStatus);

export default router;
