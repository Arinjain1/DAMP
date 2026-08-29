import express from 'express';
import { 
  sendConnectionRequest, 
  getPendingRequests, 
  updateConnectionStatus, 
  getMyNetwork, 
  getSharedProperties,
  shareProperties,
  removeSharedProperty,
  removeConnection,
  // Matchmaking
  getMatchingProperties,
  getMatchingClients,
  getMatchOpportunities,
  // Rooms/Workspace
  getActiveRooms,
  sendProposal,
  updateSplitProposal,
  closeCollabRoom,
  startDeal,
  settleSplit,
  // Tasks
  getCollabTasks,
  createCollabTask,
  updateCollabTask,
  deleteCollabTask,
  // Visits
  getCollabVisits,
  scheduleCollabVisit,
  updateCollabVisit
} from '../controllers/collabController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);

// Matchmaking
router.get('/match/properties', getMatchingProperties);
router.get('/match/clients', getMatchingClients);
router.get('/match/opportunities', getMatchOpportunities);

// Legacy connections
router.post('/connect', sendConnectionRequest);
router.get('/requests-legacy', getPendingRequests);
router.put('/requests-legacy/:requestId', updateConnectionStatus);
router.get('/my-network', getMyNetwork);
router.delete('/:collabId', removeConnection);
router.get('/:collabId/properties', getSharedProperties);
router.post('/:collabId/properties', shareProperties);
router.delete('/:collabId/properties/:propertyId', removeSharedProperty);

// Rooms / Workspaces
router.get('/rooms', getActiveRooms);
router.post('/requests', sendProposal);
router.put('/rooms/:roomId/split', updateSplitProposal);
router.post('/rooms/:roomId/close', closeCollabRoom);
router.post('/rooms/:roomId/start-deal', startDeal);
router.post('/rooms/:roomId/settle-split', settleSplit);

// Tasks
router.get('/rooms/:roomId/tasks', getCollabTasks);
router.post('/rooms/:roomId/tasks', createCollabTask);
router.put('/rooms/:roomId/tasks/:taskId', updateCollabTask);
router.delete('/rooms/:roomId/tasks/:taskId', deleteCollabTask);

// Site visits
router.get('/rooms/:roomId/visits', getCollabVisits);
router.post('/rooms/:roomId/visits', scheduleCollabVisit);
router.put('/rooms/:roomId/visits/:visitId', updateCollabVisit);

export default router;