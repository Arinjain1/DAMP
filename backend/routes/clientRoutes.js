import express from 'express';
import {
  addClient,
  getClients,
  updateClient,
  getClientDetails,
  createDeal,
  getDealDetails,
  getDeals,
  scheduleDealMeeting,
  updateDealStage,
  submitTokenPayment,
  updateClientStage,
  updateClientProperties,
  toggleTaskStatus,
  deleteClient,
  deleteDeal
} from '../controllers/clientController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', getClients);
router.post('/', addClient);
router.get('/deals', getDeals);
router.put('/:id', updateClient);
router.post('/deal', createDeal);
router.get('/deal/:id', getDealDetails);
router.post('/deal/:id/schedule', scheduleDealMeeting);
router.put('/deal/:id/stage', updateDealStage);
router.post('/deal/:id/token', submitTokenPayment);
router.get('/:id', getClientDetails);
router.put('/:id/stage', updateClientStage);
router.put('/:id/properties', updateClientProperties);
router.put('/task/:taskId/toggle', toggleTaskStatus);
router.delete('/:id', deleteClient);
router.delete('/deal/:id', deleteDeal);

export default router;