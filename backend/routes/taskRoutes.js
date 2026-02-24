import express from 'express';
import { createTask, getTasks, toggleTaskStatus } from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.get('/',requireActiveSubscription, getTasks);
router.post('/',requireActiveSubscription, createTask);
router.put('/:id/status',requireActiveSubscription, toggleTaskStatus);

export default router;