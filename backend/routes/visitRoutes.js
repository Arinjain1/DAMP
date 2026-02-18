import express from 'express';
import { createSiteVisit, getVisitDetails, submitVisitFeedback } from '../controllers/visitController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', createSiteVisit);             
router.get('/:id', getVisitDetails);            
router.put('/item/:itemId', submitVisitFeedback); 

export default router;