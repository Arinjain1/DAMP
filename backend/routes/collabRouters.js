import express from 'express';
import { searchBrokers, sendConnectionRequest, getMyNetwork } from '../controllers/collabController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/search', searchBrokers);
router.post('/connect', sendConnectionRequest);
router.get('/my-network', getMyNetwork);

export default router;