import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  getNegotiation,
  updateNegotiation, 
  addTransaction, 
  completeTransaction, 
  getDealHistory 
} from '../controllers/dealController.js';

const router = express.Router();

router.get('/:dealId/negotiation', verifyToken, getNegotiation);
router.put('/:dealId/negotiation', verifyToken, updateNegotiation);
router.post('/:dealId/transactions', verifyToken, addTransaction);
router.put('/transactions/:transactionId/complete', verifyToken, completeTransaction);
router.get('/:dealId/history', verifyToken, getDealHistory);

export default router;