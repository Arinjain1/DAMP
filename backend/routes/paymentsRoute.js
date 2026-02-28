import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Both routes require the user to be logged in (verifyToken)
router.post('/create-order', verifyToken, createOrder);
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;