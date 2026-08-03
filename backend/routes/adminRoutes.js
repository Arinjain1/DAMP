import express from 'express';
import { 
  getStats, 
  getBrokers, 
  updateBrokerStatus, 
  getTransactions, 
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
router.get('/transactions', getTransactions);
router.get('/properties', getProperties);
router.put('/properties/:id/status', updatePropertyStatus);

export default router;
