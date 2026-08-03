import express from 'express';
import { 
  sendConnectionRequest, 
  getPendingRequests, 
  updateConnectionStatus, 
  getMyNetwork, 
  getSharedProperties,
  shareProperties,
  removeSharedProperty,
  removeConnection 
} from '../controllers/collabController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.post('/connect', sendConnectionRequest);
router.get('/requests', getPendingRequests);
router.put('/requests/:requestId', updateConnectionStatus);
router.get('/my-network', getMyNetwork);
router.delete('/:collabId', removeConnection);
router.get('/:collabId/properties', getSharedProperties);
router.post('/:collabId/properties', shareProperties);
router.delete('/:collabId/properties/:propertyId', removeSharedProperty);

export default router;