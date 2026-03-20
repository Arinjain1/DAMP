import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  updateNegotiation, 
  addTransaction, 
  completeTransaction, 
  getDealHistory,
  cancelTransaction
} from '../controllers/dealController.js';

const router = express.Router();

router.put('/:dealId/negotiation', verifyToken, updateNegotiation);
router.post('/:dealId/transactions', verifyToken, addTransaction);
router.put('/transactions/:transactionId/complete', verifyToken, completeTransaction);
router.get('/:dealId/history', verifyToken, getDealHistory);
router.put('/transactions/:transactionId/cancel', verifyToken, cancelTransaction); 
export default router;