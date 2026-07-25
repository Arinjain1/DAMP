import express from 'express';
import { searchBrokers, sendConnectionRequest, getMyNetwork, getPendingRequests, updateConnectionStatus } from '../controllers/collabController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/search', searchBrokers);
router.post('/connect', sendConnectionRequest);
router.get('/my-network', getMyNetwork);
router.get('/requests', getPendingRequests);
router.put('/requests/:requestId', updateConnectionStatus);
router.delete('/requests/:requestId', updateConnectionStatus); 
export default router;