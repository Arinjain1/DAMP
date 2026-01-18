import express from 'express';
import { createTask, getTasks, toggleTaskStatus } from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id/status', toggleTaskStatus);

export default router;