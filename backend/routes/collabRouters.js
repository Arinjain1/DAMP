import express from 'express';
import { searchBrokers, sendConnectionRequest, getMyNetwork } from '../controllers/collabController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/search', searchBrokers);
router.post('/request', sendConnectionRequest);
router.get('/network', getMyNetwork);

export default router;