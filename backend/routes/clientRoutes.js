import express from 'express';
import { 
  addClient, 
  getClients,
  updateClient,
  getClientDetails, 
  createDeal, 
  getDealDetails,      
  scheduleDealMeeting ,
  updateDealStage,
  submitTokenPayment   
} from '../controllers/clientController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getClients);
router.post('/', addClient);
router.put('/:id', updateClient);
router.post('/deal', createDeal); 
router.get('/:id', getClientDetails);
router.get('/deal/:id', getDealDetails);            
router.post('/deal/:id/schedule', scheduleDealMeeting); 
router.put('/deal/:id/stage', updateDealStage);
router.post('/deal/:id/token', submitTokenPayment);

export default router;